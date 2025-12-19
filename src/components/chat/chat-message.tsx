"use client";

import { FC, useState, useRef, useEffect } from 'react';
import type { Message } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Bot, User, MoreHorizontal, Edit, RefreshCw, Copy, Check, ClipboardType } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

type ChatMessageProps = {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
  onRetry: (messageId: string) => void;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, onEdit, onRetry }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(typeof message.content === 'string' ? message.content : '');
  const [justCopied, setJustCopied] = useState(false);
  const [justCopiedMD, setJustCopiedMD] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isAgent = message.role === 'agent';

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);
  
  const handleCopy = (format: 'text' | 'markdown') => {
    const content = typeof message.content === 'string' ? message.content : '';
    if (!content) return;
    
    const textToCopy = format === 'markdown' ? "```\n" + content + "\n```" : content;
    navigator.clipboard.writeText(textToCopy).then(() => {
      if(format === 'markdown'){
        setJustCopiedMD(true);
        setTimeout(() => setJustCopiedMD(false), 2000);
      } else {
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      }
      toast({ title: 'Copied to clipboard' });
    }).catch(err => {
      toast({ variant: 'destructive', title: 'Failed to copy', description: err.message });
    });
  };
  
  const handleEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleEdit();
    } else if (event.key === 'Escape') {
      setIsEditing(false);
      setEditedContent(typeof message.content === 'string' ? message.content : '');
    }
  };

  const handleTextareaInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = event.currentTarget;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className={cn('group/message flex items-start gap-4 w-full max-w-3xl mx-auto', isAgent ? 'justify-start' : 'justify-end')}>
      {isAgent && (
        <Avatar className="w-8 h-8 border bg-background">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot size={18} />
          </AvatarFallback>
        </Avatar>
      )}

      {!isAgent && (
         <div className="flex-shrink-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRetry(message.id)}>
                  <RefreshCw className="mr-2" /> Retry
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCopy('text')}>
                  {justCopied ? <Check className="mr-2 text-green-500" /> : <Copy className="mr-2" />} Copy text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopy('markdown')}>
                   {justCopiedMD ? <Check className="mr-2 text-green-500" /> : <ClipboardType className="mr-2" />} Copy as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      )}

      <div
        className={cn(
          'relative max-w-xl rounded-lg px-4 py-3 text-sm shadow-sm',
          isAgent
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground',
          isEditing && 'w-full'
        )}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => {
                setEditedContent(e.target.value)
                handleTextareaInput(e);
              }}
              onKeyDown={handleKeyDown}
              onBlur={handleEdit}
              className="w-full text-sm"
              rows={1}
            />
          </div>
        ) : (
          typeof message.content === 'string' ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
              message.content
          )
        )}
      </div>
      
      {isAgent && (
        <div className="flex-shrink-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onRetry(message.id)}>
                <RefreshCw className="mr-2" /> Regenerate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => handleCopy('text')}>
                {justCopied ? <Check className="mr-2 text-green-500" /> : <Copy className="mr-2" />} Copy text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopy('markdown')}>
                 {justCopiedMD ? <Check className="mr-2 text-green-500" /> : <ClipboardType className="mr-2" />} Copy as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {!isAgent && (
        <Avatar className="w-8 h-8 border bg-background">
          <AvatarFallback>
            <User size={18} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
