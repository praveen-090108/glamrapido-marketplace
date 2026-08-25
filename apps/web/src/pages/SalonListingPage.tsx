import { Filter, Grid2X2, List, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SalonCard } from "../components/Cards";
import { dollars, fetchSalons, type Salon } from "../data/api";

const categories = ["Hair", "Makeup", "Nails", "Facial", "Massage", "Spa"];
const defaultPriceRange = { min: 0, max: 20000 };
const ratings = [4.5, 4.0, 3.5, 3.0];
const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Rating", value: "rating" },
  { label: "Nearest", value: "distance" },
  { label: "Price Low", value: "price-low" },
  { label: "Price High", value: "price-high" }
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

export function SalonListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;
  const [searchTerm, setSearchTerm] = useState(q);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [priceRange, setPriceRange] = useState(defaultPriceRange);
  const [selectedRating, setSelectedRating] = useState(4.5);
  const [offersOnly, setOffersOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortValue>("popularity");
  const { data: salons = [], isError, isLoading } = useQuery({
    queryKey: ["salons", q],
    queryFn: () => fetchSalons({ q: q || undefined })
  });
  const categoryCounts = useMemo(() => getCategoryCounts(salons), [salons]);
  const filteredSalons = useMemo(() => {
    const filtered = salons.filter((salon) => {
    const serviceCategories = salon.services?.map((service) => service.category) ?? [];
    const servicePrices = salon.services?.map((service) => service.priceCents) ?? [];
    const matchesCategory = selectedCategories.length ? selectedCategories.some((item) => serviceCategories.includes(item)) : true;
    const matchesPrice = servicePrices.length ? servicePrices.some((price) => price >= priceRange.min && price <= priceRange.max) : true;
    const matchesRating = salon.rating >= selectedRating;
    const matchesOffer = offersOnly ? Boolean(salon.offers?.length) : true;
    return matchesCategory && matchesPrice && matchesRating && matchesOffer;
    });

    return sortSalons(filtered, sortBy);
  }, [offersOnly, priceRange.max, priceRange.min, salons, selectedCategories, selectedRating, sortBy]);

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  useEffect(() => {
    setSelectedCategories(category ? [category] : []);
  }, [category]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    const nextQuery = searchTerm.trim();

    if (nextQuery) {
      nextParams.set("q", nextQuery);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  }

  function clearSearch() {
    setSearchTerm("");
    setSearchParams({});
    setSelectedCategories([]);
    setPriceRange(defaultPriceRange);
    setSelectedRating(4.5);
    setOffersOnly(false);
    setSortBy("popularity");
  }

  function toggleCategory(nextCategory: string) {
    setSelectedCategories((current) => current.includes(nextCategory) ? current.filter((item) => item !== nextCategory) : [...current, nextCategory]);
  }

  function applyFilters() {
    const nextParams = new URLSearchParams(searchParams);
    if (selectedCategories.length === 1) {
      nextParams.set("category", selectedCategories[0]);
    } else {
      nextParams.delete("category");
    }
    setSearchParams(nextParams);
  }

  function updateMinPrice(nextValue: number) {
    setPriceRange((current) => ({ ...current, min: Math.min(nextValue, current.max) }));
  }

  function updateMaxPrice(nextValue: number) {
    setPriceRange((current) => ({ ...current, max: Math.max(nextValue, current.min) }));
  }

  return (
    <div className="space-y-8">
      <section className="listing-hero">
        <div>
          <p className="script text-2xl text-brand-500">Find Your Perfect Salon</p>
          <h1 className="mt-3 text-5xl font-black leading-tight">Explore Top Salons<br /><span className="text-brand-500">Near You</span></h1>
          <p className="mt-5 max-w-md text-lg text-slate-700">Choose from the best salons, compare reviews and book with ease.</p>
        </div>
        <div className="listing-hero-art">
          <img src="/images/the-glam-studio.jpg" alt="Salon interior" />
        </div>
      </section>
      <form className="search-panel" onSubmit={handleSearch}>
        <div className="grid gap-4 lg:grid-cols-[260px_1fr_220px_140px]">
          <button className="select-box" type="button"><MapPin className="text-brand-500" /> New York, USA</button>
          <label className="select-box"><Search className="text-muted" /><input className="w-full bg-transparent outline-none" placeholder="Search for salons, services..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
          <label className="select-box"><SlidersHorizontal className="text-brand-500" /> Sort by <select className="min-w-0 flex-1 bg-transparent font-bold outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortValue)}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <button className="btn-primary" type="submit"><Filter size={19} /> Search</button>
        </div>
      </form>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="card hidden p-5 lg:block">
          <div className="mb-5 flex justify-between"><strong>Categories</strong><button className="text-sm text-brand-500" type="button" onClick={clearSearch}>Clear All</button></div>
          {categories.map((item) => (
            <label className="filter-row" key={item}><input type="checkbox" checked={selectedCategories.includes(item)} onChange={() => toggleCategory(item)} /> {item}<span>{categoryCounts[item] ?? 0}</span></label>
          ))}
          <hr className="my-5 border-pink-100" />
          <div className="flex items-center justify-between"><strong>Price Range</strong><span className="text-sm font-bold text-brand-500">{dollars(priceRange.min)} - {dollars(priceRange.max)}</span></div>
          <div className="mt-4 rounded-lg bg-brand-50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold text-muted">Min<input className="input mt-1 w-full px-3 py-2" min={0} max={defaultPriceRange.max / 100} step={5} type="number" value={priceRange.min / 100} onChange={(event) => updateMinPrice(Number(event.target.value) * 100)} /></label>
              <label className="text-xs font-bold text-muted">Max<input className="input mt-1 w-full px-3 py-2" min={0} max={defaultPriceRange.max / 100} step={5} type="number" value={priceRange.max / 100} onChange={(event) => updateMaxPrice(Number(event.target.value) * 100)} /></label>
            </div>
            <div className="mt-4 space-y-3">
              <input className="price-range-input" min={0} max={defaultPriceRange.max} step={500} type="range" value={priceRange.min} onChange={(event) => updateMinPrice(Number(event.target.value))} />
              <input className="price-range-input" min={0} max={defaultPriceRange.max} step={500} type="range" value={priceRange.max} onChange={(event) => updateMaxPrice(Number(event.target.value))} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-muted"><span>{dollars(0)}</span><span>{dollars(defaultPriceRange.max)}+</span></div>
          </div>
          <strong>Rating</strong>
          <div className="mt-4 flex flex-wrap gap-2">{ratings.map((rating) => <button className={`price-chip ${selectedRating === rating ? "active" : ""}`} key={rating} type="button" onClick={() => setSelectedRating(rating)}>★ {rating.toFixed(1)}+</button>)}</div>
          <hr className="my-5 border-pink-100" />
          <strong>Offers</strong>
          <label className="filter-row mt-4"><input type="checkbox" checked={offersOnly} onChange={(event) => setOffersOnly(event.target.checked)} /> Show salons with offers only</label>
          <button className="btn-primary mt-8 w-full" type="button" onClick={applyFilters}>Apply Filter</button>
          <button className="btn-outline mt-3 w-full" type="button" onClick={clearSearch}>Clear Filters</button>
        </aside>
        <section className="card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">{filteredSalons.length} Salons Found</h2>
              {q || category ? <p className="mt-1 text-sm text-muted">Results {q ? `for "${q}"` : ""}{category ? ` in ${category}` : ""}</p> : null}
            </div>
            {q || category ? <button className="btn-outline px-4 py-2 text-sm" onClick={clearSearch} type="button">Clear Search</button> : null}
            <div className="flex gap-2"><button className="icon-btn active"><Grid2X2 /></button><button className="icon-btn"><List /></button></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {isLoading ? <p className="text-muted">Loading salons...</p> : null}
            {isError ? (
              <div className="rounded-md border border-pink-100 bg-pink-50 p-6 text-muted md:col-span-2 xl:col-span-4">
                Unable to load salons. Please make sure the API server is running on port 4000 and MySQL has been seeded.
              </div>
            ) : null}
            {!isLoading && !isError && filteredSalons.length === 0 ? (
              <div className="rounded-md border border-pink-100 bg-pink-50 p-6 text-muted md:col-span-2 xl:col-span-4">
                No salons found for the selected search and filters.
              </div>
            ) : null}
            {!isLoading && !isError ? filteredSalons.map((salon, index) => <SalonCard key={salon.slug} salon={salon} index={index} />) : null}
          </div>
        </section>
      </div>
      <section className="promo-banner light"><img src="/images/promo-girl.jpg" alt="" /><strong>30% OFF</strong><span>Use Code: <b>GLAM30</b></span></section>
    </div>
  );
}

function getCategoryCounts(salons: Salon[]) {
  return salons.reduce<Record<string, number>>((counts, salon) => {
    const uniqueCategories = new Set(salon.services?.map((service) => service.category) ?? []);
    uniqueCategories.forEach((category) => {
      counts[category] = (counts[category] ?? 0) + 1;
    });
    return counts;
  }, {});
}

function sortSalons(salons: Salon[], sortBy: SortValue) {
  return [...salons].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (sortBy === "distance") return a.distanceKm - b.distanceKm;
    if (sortBy === "price-low") return minServicePrice(a) - minServicePrice(b);
    if (sortBy === "price-high") return maxServicePrice(b) - maxServicePrice(a);
    return b.reviewCount - a.reviewCount || b.rating - a.rating;
  });
}

function minServicePrice(salon: Salon) {
  const prices = salon.services?.map((service) => service.priceCents) ?? [];
  return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
}

function maxServicePrice(salon: Salon) {
  const prices = salon.services?.map((service) => service.priceCents) ?? [];
  return prices.length ? Math.max(...prices) : 0;
}
