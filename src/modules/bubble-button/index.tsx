import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MessageSquare, Minimize2, Maximize2 } from 'lucide-react';
import ContentWrapper from '../content-wrapper';
import { useState } from 'react';
import { cn } from '@/lib/utils';

function BubbleButton() {
  const [open, setOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const defaultSize = { width: 484, height: 500 };
  const maximizedSize = { width: 768, height: 700 };
  const size = isMaximized ? maximizedSize : defaultSize;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-10 h-10 rounded-full p-0 transition-colors',
              open && 'bg-primary/90 text-primary-foreground shadow-lg'
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="p-0 shadow-lg relative mb-1"
          style={{
            width: size.width,
            height: size.height,
            transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
          }}
        >
          <div className="absolute top-3 right-2 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="h-full overflow-hidden rounded-md">
            <ContentWrapper />
          </div>
          <div className="absolute -bottom-1 right-4 w-2 h-2 rotate-45 bg-popover border-r border-b" />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default BubbleButton;
