/**
 * GET /api/vidsrc-domain
 *
 * Varsayılan domain: https://vidsrc-embed.su
 *
 * Önce varsayılan domain'in çalışıp çalışmadığını kontrol eder (HEAD request).
 * Çalışmıyorsa https://vidsrc.domains/ sayfasından "NEW DOMAINS" altındaki
 * ilk "Live" domain'i alır.
 *
 * HTML yapısı:
 *   <li><h3>NEW DOMAINS:</h3></li>
 *   <li><a href="https://...">...<span class="live-text">Live</span></a></li>
 *
 * Sonuç 1 saat cache'lenir.
 */

const DEFAULT_DOMAIN = "https://vidsrc-embed.su";

export const revalidate = 3600;

async function isDomainAlive(domain) {
  try {
    const res = await fetch(domain, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok || res.status === 403; // 403 = site var ama embed dışı erişim engelli
  } catch {
    return false;
  }
}

async function scrapeFirstNewDomain() {
  const res = await fetch("https://vidsrc.domains/", {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`vidsrc.domains ${res.status} döndü`);
  }

  const html = await res.text();

  // "NEW DOMAINS:" başlığından sonraki ilk <a> etiketini bul
  // Regex: NEW DOMAINS başlığını bul, sonra ilk href'i yakala
  const newDomainsSection = html.split(/NEW DOMAINS/i)[1];
  if (!newDomainsSection) {
    throw new Error("NEW DOMAINS bölümü bulunamadı");
  }

  // "Live" içeren ilk <a href="..."> etiketini bul
  const liveMatch = newDomainsSection.match(
    /<a\s+href=["'](https?:\/\/[^"']+)["'][^>]*>[\s\S]*?<span[^>]*class=["']live-text["'][^>]*>Live<\/span>/i
  );

  if (liveMatch) {
    return liveMatch[1].replace(/\/+$/, "");
  }

  // Live bulunamazsa NEW DOMAINS altındaki herhangi bir <a href> al
  const anyMatch = newDomainsSection.match(
    /<a\s+href=["'](https?:\/\/[^"']+)["']/i
  );

  if (anyMatch) {
    return anyMatch[1].replace(/\/+$/, "");
  }

  throw new Error("Hiç yeni domain bulunamadı");
}

export async function GET() {
  try {
    // 1. Varsayılan domain çalışıyor mu kontrol et
    const alive = await isDomainAlive(DEFAULT_DOMAIN);

    if (alive) {
      return Response.json({ domain: DEFAULT_DOMAIN, source: "default" });
    }

    // 2. Varsayılan çalışmıyorsa, vidsrc.domains'den yeni domain al
    console.log("Varsayılan domain yanıt vermiyor, yeni domain aranıyor...");
    const newDomain = await scrapeFirstNewDomain();

    return Response.json({ domain: newDomain, source: "scraped" });
  } catch (err) {
    console.error("vidsrc-domain resolver hatası:", err.message);
    // Her durumda çalışan bir fallback döndür
    return Response.json(
      { domain: DEFAULT_DOMAIN, source: "fallback", error: err.message },
      { status: 200 }
    );
  }
}
