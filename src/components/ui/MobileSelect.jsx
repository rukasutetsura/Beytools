import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger
} from '@/components/ui/drawer';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileSelect({ value, onChange, placeholder, options = [], triggerClassName }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              triggerClassName
            )}
          >
            <span className={cn('truncate', !selected && 'text-muted-foreground')}>
              {selected?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-center">{placeholder || 'Seleccionar'}</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[50vh] overflow-y-auto px-2 pb-6">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-3 text-sm rounded-lg transition-colors',
                  opt.value === value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary'
                )}
              >
                <span className="text-left">{opt.label}</span>
                {opt.value === value && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}