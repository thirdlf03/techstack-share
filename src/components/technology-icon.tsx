import { getTechnologyIconDataUrl } from "@/lib/technology-icons";
import { cn } from "@/lib/utils";

type TechnologyIconProps = {
  className?: string;
  dataTestId?: string;
  size?: number;
  techId: string;
};

export function TechnologyIcon({ techId, className, size = 32, dataTestId }: TechnologyIconProps) {
  const src = getTechnologyIconDataUrl(techId);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 object-contain", className)}
      data-testid={dataTestId}
      decoding="async"
      height={size}
      src={src}
      width={size}
    />
  );
}
