'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import { Camera } from 'lucide-react';

interface Image {
	src: string;
	alt?: string;
	challenge?: string;
}

interface ZoomParallaxProps {
	/** Array of images to be displayed in the parallax effect max 7 images */
	images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
	const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
	const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
	const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
	const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

	const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

	const mainLabelOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

	return (
		<div ref={container} className="relative h-auto md:h-[300vh]">
			{/* Desktop Parallax Effect */}
			<div className="hidden md:block sticky top-0 h-screen overflow-hidden">
				{images.map(({ src, alt, challenge }, index) => {
					const scale = scales[index % scales.length];

					return (
						<motion.div
							key={index}
							style={{ scale }}
							className={`absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' : ''} ${index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' : ''} ${index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' : ''} ${index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' : ''} ${index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' : ''} ${index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : ''} `}
						>
							<div className="relative h-[25vh] w-[25vw]">
								<img
									src={src || '/placeholder.svg'}
									alt={alt || `Parallax image ${index + 1}`}
									className="h-full w-full object-cover rounded-lg shadow-lg"
								/>
								{challenge && (
									<motion.div 
										style={{ opacity: index === 0 ? mainLabelOpacity : 1 }}
										className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)] bg-gradient-to-br from-white/60 via-white/20 to-transparent backdrop-blur-md"
									>
										<Camera className="w-3 h-3 text-gray-800" />
										<p className="text-[10px] uppercase tracking-wide font-bold text-gray-800 text-center">{challenge}</p>
									</motion.div>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			{/* Mobile Static Grid */}
			<div className="md:hidden grid grid-cols-2 gap-3 px-6 py-4">
				{images.slice(0, 4).map(({ src, alt, challenge }, index) => (
					<div 
						key={`mobile-${index}`}
						className={`relative w-full overflow-hidden rounded-2xl shadow-sm ${index === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
					>
						<img
							src={src || '/placeholder.svg'}
							alt={alt || `Mobile image ${index + 1}`}
							className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
						/>
						{challenge && (
							<div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15),inset_0_1px_1px_rgba(255,255,255,0.6)] bg-gradient-to-br from-white/60 via-white/20 to-transparent backdrop-blur-md max-w-[85%]">
								<Camera className="w-2.5 h-2.5 text-gray-800 flex-shrink-0" />
								<p className="text-[8px] uppercase tracking-wide font-bold text-gray-800 text-center truncate">{challenge}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
