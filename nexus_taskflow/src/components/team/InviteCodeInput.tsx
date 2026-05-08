import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface InviteCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
}

export default function InviteCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error
}: InviteCodeInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Format: 12345A (6 characters: 5 numbers, 1 letter)
  
  const processValue = (val: string) => {
    const cleaned = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleaned.slice(0, length);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.toUpperCase();
    
    // Character validation logic
    if (index < 5) {
      // First 5 must be numbers
      if (val && !/^\d$/.test(val)) return;
    } else {
      // Last character must be letter
      if (val && !/^[A-Z]$/.test(val)) return;
    }

    const newValue = value.split('');
    newValue[index] = val;
    const combinedValue = processValue(newValue.join(''));
    onChange(combinedValue);

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (combinedValue.length === length && onComplete) {
      onComplete(combinedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const newValue = value.split('');
      newValue[index - 1] = '';
      onChange(processValue(newValue.join('')));
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const rawPaste = e.clipboardData.getData('text').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Validate paste content for the pattern 12345A
    let pasteData = "";
    for (let i = 0; i < Math.min(rawPaste.length, length); i++) {
        if (i < 5) {
            if (/\d/.test(rawPaste[i])) pasteData += rawPaste[i];
            else break;
        } else {
            if (/[A-Z]/.test(rawPaste[i])) pasteData += rawPaste[i];
            else break;
        }
    }
    
    onChange(pasteData);
    
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputs.current[nextIndex]?.focus();
    
    if (pasteData.length === length && onComplete) {
      onComplete(pasteData);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      {Array.from({ length }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="relative">
            <input
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={value[i] || ''}
              onChange={(e) => handleInput(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className={cn(
                "w-10 h-14 md:w-12 md:h-16 text-center text-2xl font-black bg-[var(--color-surface-secondary)] border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                error 
                  ? "border-red-500 text-red-500 animate-shake" 
                  : value[i] 
                    ? "border-blue-600 text-blue-500 shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]" 
                    : "border-[var(--color-border)] text-[var(--color-text)]"
              )}
            />
            {value[i] && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 rounded-xl pointer-events-none border border-blue-400/30"
              />
            )}
          </div>
          {i === 4 && (
            <div className="w-2 h-0.5 bg-[var(--color-border)] rounded-full mx-1 opacity-50" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
