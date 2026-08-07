import type { Metadata } from "next";
import { FavouritesClient } from "@/components/dictionary/FavouritesClient";

export const metadata: Metadata = {
  title: "Favourites",
  description: "Words you have saved from the adult Dominican Kwéyòl dictionary.",
};

export default function FavouritesPage() {
  return (
    <div className="dict-page">
      <header className="dict-page__header">
        <h1>Favourites</h1>
        <p>
          Your personal study list on this device — listen, remove words, print a
          sheet, or open flashcards. No account is required.
        </p>
      </header>
      <FavouritesClient />
    </div>
  );
}
