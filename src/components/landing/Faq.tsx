
import { ChevronRight } from "lucide-react";

import { type InferSelectModel } from 'drizzle-orm';
import { faqs as faqsSchema } from '@/db/schema';

type FaqItem = InferSelectModel<typeof faqsSchema>;

export function Faq({ faqs }: { faqs: FaqItem[] }) {

  return (
    <section id="faq" className="border-t border-border bg-secondary py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl lg:mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Perguntas frequentes</h2>
          <p className="mt-2 text-muted-foreground">Tudo que você precisa saber antes de assinar.</p>
        </div>
        <div className="grid max-w-4xl gap-4 md:grid-cols-2">
          {faqs.map((item) => (
            <details key={item.id} className="group rounded-2xl border border-border bg-card p-5 transition-colors open:bg-background">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium text-card-foreground">
                {item.question}
                <ChevronRight className="h-5 w-5 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
