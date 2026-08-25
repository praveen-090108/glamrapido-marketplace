import type { Salon } from "../data/api";

export function SalonImage({ salon, large = false, className = "" }: { salon?: Pick<Salon, "name" | "imageUrl"> & { offer?: string; palette?: string }; large?: boolean; className?: string }) {
  return (
    <div className={`salon-visual palette-${salon?.palette ?? "pink"} ${large ? "salon-visual-large" : ""} ${className}`}>
      {salon?.imageUrl ? <img src={salon.imageUrl} alt={salon.name} /> : null}
      {salon?.offer ? <span className="discount">{salon.offer}</span> : null}
      <strong>{salon?.name ?? "The Glam Studio"}</strong>
    </div>
  );
}

const portraitMap: Record<string, string> = {
  EW: "/images/emma-wilson.jpg",
  E: "/images/emma-wilson.jpg",
  SM: "/images/sophia-martinez.jpg",
  S: "/images/sophia-martinez.jpg",
  OB: "/images/olivia-brown.jpg",
  O: "/images/olivia-brown.jpg",
  AJ: "/images/ava-johnson.jpg",
  A: "/images/ava-johnson.jpg",
  JB: "/images/jessica-brown.jpg",
  GR: "/images/hero-beauty.jpg"
};

export function BeautyPortrait({ className = "", label = "JB", src }: { className?: string; label?: string; src?: string }) {
  const image = src ?? portraitMap[label];
  return (
    <div className={`beauty-portrait ${className}`}>
      {image ? <img src={image} alt={label} /> : <span>{label}</span>}
    </div>
  );
}

const serviceMap: Record<string, string> = {
  portrait: "/images/service-haircut.jpg",
  hair: "/images/service-hair-color.jpg",
  nails: "/images/service-gel-manicure.jpg",
  facial: "/images/service-hydra-facial.jpg"
};

export function ServiceImage({ type, src }: { type: string; src?: string }) {
  const image = src ?? serviceMap[type];
  return <div className={`service-visual service-${type}`}>{image ? <img src={image} alt="" /> : null}</div>;
}
