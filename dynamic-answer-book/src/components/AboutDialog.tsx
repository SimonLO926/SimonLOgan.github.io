import { ANSWER_COUNT } from '@/data/answers'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Copy } from '@/lib/copy'

export function AboutDialog({
  open,
  onOpenChange,
  copy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  copy: Copy
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 bg-[var(--paper)] text-[var(--paper-ink)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium text-[var(--paper-ink)]">
            {copy.aboutTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">{copy.aboutTitle}</DialogDescription>
        </DialogHeader>
        <div className="about-copy">
          {copy.aboutBody.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
          <p className="note">{copy.aboutNote(ANSWER_COUNT)}</p>
          <p className="note">{copy.keys}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
