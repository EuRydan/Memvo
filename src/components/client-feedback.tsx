"use client";
import { TimelineContent } from "@/components/ui/timeline-animation";
import Image from "next/image";
import { useRef } from "react";

function ClientFeedback() {
    const testimonialRef = useRef<HTMLDivElement>(null);
  
    const revealVariants = {
      visible: (i: number) => ({
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          delay: i * 0.4,
          duration: 0.5,
        },
      }),
      hidden: {
        filter: "blur(10px)",
        y: -20,
        opacity: 0,
      },
    };
  
  return (
    <section className="relative h-full container text-black mx-auto rounded-lg py-14 bg-transparent" ref={testimonialRef}>
      <article className={"max-w-screen-md mx-auto text-center space-y-2 mb-8"} >
        <TimelineContent as="h1" className={"xl:text-4xl text-3xl font-medium tracking-tight text-ink"} animationNum={0} customVariants={revealVariants} timelineRef={testimonialRef} style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Confiado por centenas de anfitriões
        </TimelineContent>
        <TimelineContent as="p" className={"mx-auto text-slate text-sm"} animationNum={1} customVariants={revealVariants} timelineRef={testimonialRef}>
          Veja o que as pessoas estão dizendo sobre a experiência Memvo em seus eventos.
        </TimelineContent>
      </article>
      <div className="lg:grid lg:grid-cols-3 gap-2 flex flex-col w-full lg:py-10 pt-10 pb-4 lg:px-10 px-4">
        <div className="md:flex lg:flex-col lg:space-y-2 h-full lg:gap-0 gap-2 ">
          <TimelineContent animationNum={0} customVariants={revealVariants} timelineRef={testimonialRef} className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-white text-ink overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            <article className="mt-auto relative z-10">
              <p className="text-sm leading-relaxed">
                &quot;A Memvo foi um divisor de águas no nosso casamento. O serviço é excepcional e foi a atração principal da festa para os convidados!&quot;
              </p>
              <div className="flex justify-between pt-5 items-end">
                <div>
                  <h2 className="font-semibold lg:text-lg text-sm">Ana Paula</h2>
                  <p className="text-xs text-slate">Casamento • Junho 2024</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=687&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
          <TimelineContent animationNum={1} customVariants={revealVariants} timelineRef={testimonialRef} className="lg:flex-[3] flex-[4] lg:h-fit lg:shrink-0 flex flex-col justify-between relative bg-ink text-white overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <article className="mt-auto">
              <p className="text-sm leading-relaxed">
                &quot;Vimos resultados incríveis. A facilidade de uso encantou a todos.&quot;
              </p>
              <div className="flex justify-between pt-5 items-end">
                <div>
                  <h2 className="font-semibold text-base">Rika Shinoda</h2>
                  <p className="text-xs text-slate/80">Cerimonialista</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?q=80&w=687&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
        <div className="lg:h-full md:flex lg:flex-col h-fit lg:space-y-2 lg:gap-0 gap-2">
          <TimelineContent animationNum={2} customVariants={revealVariants} timelineRef={testimonialRef} className="flex flex-col justify-between relative bg-white text-ink overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <article className="mt-auto">
              <p className="2xl:text-sm text-sm leading-relaxed">
                &quot;Uma equipe altamente profissional, as soluções inovadoras da Memvo transformaram a maneira como entregamos as fotos.&quot;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h2 className="font-semibold lg:text-lg text-base">Ricardo</h2>
                  <p className="lg:text-xs text-xs text-slate">Formatura de Medicina</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=1021&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
          <TimelineContent animationNum={3} customVariants={revealVariants} timelineRef={testimonialRef} className="flex flex-col justify-between relative bg-[#f4c5a8] text-ink overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <article className="mt-auto">
              <p className="2xl:text-sm text-sm leading-relaxed">
                &quot;Estamos extremamente satisfeitos. A plataforma superou nossas expectativas de engajamento.&quot;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h2 className="font-semibold lg:text-lg text-base">Marcello & Vanessa</h2>
                  <p className="lg:text-xs text-xs text-ink/70">Casamento na Praia</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=687&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
          <TimelineContent animationNum={4} customVariants={revealVariants} timelineRef={testimonialRef} className="flex flex-col justify-between relative bg-white text-ink overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <article className="mt-auto">
              <p className="2xl:text-sm text-sm leading-relaxed">
                &quot;O fato de não precisar instalar nenhum app facilitou a vida de todos os nossos convidados idosos.&quot;
              </p>
              <div className="flex justify-between items-end pt-5">
                <div>
                  <h2 className="font-semibold lg:text-lg text-base">Steven Sunny</h2>
                  <p className="lg:text-xs text-xs text-slate">Aniversário de 50 anos</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1740102074295-c13fae3e4f8a?q=80&w=687&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
        <div className="h-full md:flex lg:flex-col lg:space-y-2 lg:gap-0 gap-2">
          <TimelineContent animationNum={5} customVariants={revealVariants} timelineRef={testimonialRef} className="lg:flex-[3] flex-[4] flex flex-col justify-between relative bg-[#c8b8e0] text-ink overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <article className="mt-auto">
              <p className="text-sm leading-relaxed">
                &quot;A Memvo tem sido uma parceira fundamental para as festas da nossa agência.&quot;
              </p>
              <div className="flex justify-between pt-5 items-end">
                <div>
                  <h2 className="font-semibold text-base">Guilherme Rauch</h2>
                  <p className="text-xs text-ink/70">Organizador de Eventos</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1563237023-b1e970526dcb?q=80&w=765&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
          <TimelineContent animationNum={6} customVariants={revealVariants} timelineRef={testimonialRef} className="lg:flex-[7] flex-[6] flex flex-col justify-between relative bg-ink text-white overflow-hidden rounded-lg border border-slate/10 p-5 shadow-sm">
            <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:50px_56px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            <article className="mt-auto relative z-10">
              <p className="text-sm leading-relaxed">
                &quot;Os desafios divertiram todo mundo! A melhor parte foi olhar o telão no final da noite e ver fotos que o fotógrafo oficial jamais conseguiria captar.&quot;
              </p>
              <div className="flex justify-between pt-5 items-end">
                <div>
                  <h2 className="font-semibold text-base">Paulo</h2>
                  <p className="text-xs text-slate/80">Chá de Panela</p>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=687&auto=format&fit=crop"
                  alt="avatar"
                  width={200}
                  height={200}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </article>
          </TimelineContent>
        </div>
      </div>
    </section>
  );
}

export default ClientFeedback;
