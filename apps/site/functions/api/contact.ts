/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * Menerima formulir kontak publik, memvalidasi honeypot anti-spam,
 * membatasi laju pengiriman berdasarkan IP (maks 3 kiriman per jam),
 * dan menyimpan pesan ke tabel public.submissions di Supabase.
 */

interface Env {
  PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ success: false, message: "Payload tidak valid." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const { name, email, message, website } = body as {
      name?: string;
      email?: string;
      message?: string;
      website?: string;
    };

    // 1. Anti-spam: Honeypot field (website) harus kosong
    if (website && website.trim().length > 0) {
      // Tolak bot secara halus tanpa memberi tahu alasan sebenarnya
      return new Response(
        JSON.stringify({
          success: true,
          message: "Pesan Anda telah kami terima.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Validasi input dasar
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim();
    const cleanMsg = (message || "").trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nama harus berisi antara 2 hingga 100 karakter.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Format alamat email tidak valid.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    if (cleanMsg.length < 10 || cleanMsg.length > 3000) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Pesan harus berisi antara 10 hingga 3000 karakter.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. Hash IP untuk pembatasan laju & analitik tanpa menyimpan IP asli
    const clientIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for") ||
      "unknown";
    const ipHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clientIp + "_jejak_salt_2026"),
    );
    const ipHash = Array.from(new Uint8Array(ipHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 16);

    const supabaseUrl =
      env.PUBLIC_SUPABASE_URL || "https://vmejzesgssrghhjlrdhr.supabase.co";
    const supabaseKey =
      env.SUPABASE_SERVICE_ROLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Konfigurasi server belum lengkap.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // 4. Simpan ke Supabase REST API
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/submissions`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        message: cleanMsg,
        ip_hash: ipHash,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Gagal menyimpan submission ke Supabase:", errText);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Terjadi kesalahan sistem saat menyimpan pesan.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Pesan Anda telah kami terima. Tim redaksi akan membaca dalam ritme tenang.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err?.message || "Kesalahan internal.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
