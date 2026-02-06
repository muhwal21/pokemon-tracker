import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

/* ======================================================
   VALIDASI ENV
====================================================== */
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  !process.env.POKEMON_API_KEY
) {
  console.error("❌ ERROR: ENV belum lengkap!");
  process.exit(1);
}

/* ======================================================
   INIT SUPABASE
====================================================== */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/* ======================================================
   HELPER: MARKET PRICE (FALLBACK PALING AMAN)
====================================================== */
const getMarketPrice = (tcgplayer) => {
  const p = tcgplayer?.prices;
  return (
    p?.holofoil?.market ??
    p?.normal?.market ??
    p?.reverseHolofoil?.market ??
    p?.unlimitedHolofoil?.market ??
    null
  );
};

/* ======================================================
   MAIN PROCESS
====================================================== */
async function fetchAllCards() {
  let page = 1;
  const pageSize = 50;
  let totalInserted = 0;
  let hasMore = true;

  console.log("🚀 MEMULAI SINKRONISASI POKÉMON TCG");
  console.log("====================================");

  while (hasMore) {
    try {
      console.log(`📦 Fetch halaman ${page}...`);

      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            "X-Api-Key": process.env.POKEMON_API_KEY,
          },
        },
      );

      if (response.status === 429) {
        console.warn("⚠️ Rate limit! Tunggu 30 detik...");
        await new Promise((r) => setTimeout(r, 30000));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const cards = result.data || [];

      if (cards.length === 0) {
        hasMore = false;
        break;
      }

      /* ======================================================
         TRANSFORM DATA
      ====================================================== */
      const dataToInsert = cards.map((card) => {
        const rarity = card.rarity || "Common";
        const rarityGroup = rarity.includes("Secret")
          ? "Secret"
          : rarity.includes("Ultra")
            ? "Ultra"
            : rarity.includes("Rare")
              ? "Rare"
              : "Common";

        return {
          id: card.id,
          name: card.name,
          level: card.level || null,
          hp: card.hp || null,
          number: card.number || null,
          supertype: card.supertype || null,
          rarity,
          rarity_group: rarityGroup,
          flavor_text: card.flavorText || null,
          artist: card.artist || null,

          // classification
          subtypes: card.subtypes || [],
          types: card.types || [],
          evolves_from: card.evolvesFrom || null,
          national_pokedex_numbers: card.nationalPokedexNumbers || [],

          // images
          image_small: card.images?.small || null,
          image_large: card.images?.large || null,

          // set
          set_id: card.set?.id || null,
          set_name: card.set?.name || null,
          series: card.set?.series || null,
          release_date: card.set?.releaseDate
            ? card.set.releaseDate.replace(/\//g, "-")
            : null,
          set_logo: card.set?.images?.logo || null,
          set_symbol: card.set?.images?.symbol || null,

          // gameplay
          attacks: card.attacks || [],
          abilities: card.abilities || [],
          weaknesses: card.weaknesses || [],
          resistances: card.resistances || [],
          retreat_cost: card.retreatCost || [],
          converted_retreat_cost: card.convertedRetreatCost || null,

          // legalities
          legalities: card.legalities || {},
          is_standard_legal: card.legalities?.standard === "Legal",
          is_expanded_legal: card.legalities?.expanded === "Legal",
          is_unlimited_legal: card.legalities?.unlimited === "Legal",

          // prices
          tcgplayer_prices: card.tcgplayer?.prices || {},
          cardmarket_prices: card.cardmarket?.prices || {},
          tcgplayer_market_price: getMarketPrice(card.tcgplayer),
          cardmarket_trend_price: card.cardmarket?.prices?.trendPrice ?? null,
          market_price: getMarketPrice(card.tcgplayer),

          // raw
          full_json: card,
          updated_at: new Date().toISOString(),
        };
      });

      /* ======================================================
         UPSERT SUPABASE
      ====================================================== */
      const { error } = await supabase
        .from("cards")
        .upsert(dataToInsert, { onConflict: "id" });

      if (error) {
        console.error(`❌ Error halaman ${page}:`, error.message);
      } else {
        totalInserted += dataToInsert.length;
        console.log(`✅ Halaman ${page} OK (${dataToInsert.length} kartu)`);
      }

      if (cards.length < pageSize) {
        hasMore = false;
      }

      page++;
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error("⚠️ Error:", err.message);
      console.log("Sistem istirahat 30 detik sebelum mencoba lagi...");
      await new Promise((r) => setTimeout(r, 30000)); // <--- Ubah jadi 30 detik
    }
  }

  console.log("====================================");
  console.log(`🎉 SELESAI! Total kartu: ${totalInserted}`);
}

/* ======================================================
   RUN
====================================================== */
fetchAllCards();
