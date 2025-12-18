"use client";

import { useState, useRef, type FC, type KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp, Paperclip } from 'lucide-react';
import { Input } from '../ui/input';

type ChatInputProps = {
  onSendMessage: (input: string, file?: File) => void;
  isLoading: boolean;
};

const ChatInput: FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim() || file) {
      onSendMessage(input, file);
      setInput('');
      setFile(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
        <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Attach file"
        >
            <Paperclip size={18} />
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={file ? `${file.name} attached` : "Tell the agent what to do..."}
        className="pl-14 pr-14 min-h-[52px] max-h-48 resize-none"
        rows={1}
        disabled={isLoading}
        aria-label="Chat input"
      />
      <Button
        type="submit"
        size="icon"
        className="absolute right-3 top-[14px] h-9 w-9"
        onClick={handleSend}
        disabled={isLoading || (!input.trim() && !file)}
        aria-label="Send message"
      >
        <ArrowUp size={18} />
      </Button>
    </div>
  );
};

export default ChatInput;
