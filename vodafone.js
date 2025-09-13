import fs from "fs";
import axios from "axios";

// AYARLAR
const config = {
    threeDigits: null, // İlk 3 hane (null yapabilirsin)
    fourDigits: "0033", // Son 4 hane (null yapabilirsin)
    limit: 1000, // Kaç numara taransın
    delay: 800, // İstekler arası bekleme (ms)
    startFrom: 0, // Hangi numaradan başlasın (kaldığın yerden devam için)
};

// Numara kombinasyonu oluştur
function generateNumber(index) {
    if (config.threeDigits && config.fourDigits) {
        return config.threeDigits + config.fourDigits;
    } else if (config.threeDigits) {
        // İlk 3 hane belli, son 4 haneyi ardışık üret
        const suffix = (index + config.startFrom).toString().padStart(4, "0");
        return config.threeDigits + suffix;
    } else if (config.fourDigits) {
        // Son 4 hane belli, ilk 3 haneyi ardışık üret
        const prefix = (index + config.startFrom).toString().padStart(3, "0");
        return prefix + config.fourDigits;
    } else {
        // Tamamen rastgele 7 haneli
        return Math.floor(Math.random() * 10000000)
            .toString()
            .padStart(7, "0");
    }
}

// API'den numara sorgula
async function checkNumber(digits) {
    try {
        const url = `https://m.vodafone.com.tr/maltgtwaycbu/api?method=searchSpecialMsisdns&digits=${digits}`;

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
                Accept: "application/json, text/plain, */*",
                "Accept-Language": "tr-TR,tr;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                Referer: "https://m.vodafone.com.tr/",
                Origin: "https://m.vodafone.com.tr",
                Connection: "keep-alive",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
            },
        });

        if (
            response.data &&
            response.data.result &&
            response.data.result.result === "SUCCESS"
        ) {
            return response.data.specialMsisdns || [];
        }

        return null;
    } catch (error) {
        console.log(`❌ API Hatası (${digits}): ${error.message}`);

        // Rate limit hatası varsa biraz daha bekle
        console.log(error);
        if (error.response && error.response.status === 429) {
            console.log("⏳ Rate limit! 10 saniye bekleniyor...");
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        return null;
    }
}

// Sonuçları dosyaya kaydet (append mode)
function saveResult(digits, numbers) {
    let content = `\n=== ${digits} ===\n`;

    if (numbers && numbers.length > 0) {
        numbers.forEach((num) => {
            const type = num.msisdnType === "GOLD" ? "💎" : "📱";
            content += `${type} ${num.msisdn} | ${num.msisdnType} | ${num.specialNumberPrice}₺ | ${num.status}\n`;
        });
    } else {
        content += "Numara bulunamadı\n";
    }

    // Append mode ile ekle
    fs.appendFileSync("numaralar.txt", content, "utf8");
}

// Progress dosyasını güncelle
function saveProgress(currentIndex) {
    const progressData = {
        lastIndex: currentIndex + config.startFrom,
        timestamp: new Date().toISOString(),
        config: config,
    };
    fs.writeFileSync(
        "progress.json",
        JSON.stringify(progressData, null, 2),
        "utf8",
    );
}

// Progress dosyasından devam et
function loadProgress() {
    try {
        const progressData = JSON.parse(
            fs.readFileSync("progress.json", "utf8"),
        );
        console.log(
            `📂 Progress dosyası bulundu. Son tarama: ${progressData.lastIndex}`,
        );

        const resume = process.argv.includes("--devam");
        if (resume) {
            config.startFrom = progressData.lastIndex + 1;
            console.log(
                `🔄 Tarama ${config.startFrom} numarasından devam edecek`,
            );
        }

        return resume;
    } catch (error) {
        console.log("📂 Progress dosyası bulunamadı, baştan başlanacak");
        return false;
    }
}

// Ana fonksiyon
async function main() {
    console.log("🚀 Vodafone Numara Tarayıcı (Direkt Bağlantı)\n");

    // Progress kontrolü
    const resumed = loadProgress();

    // Konfigürasyonu göster
    console.log("⚙️ AYARLAR:");
    console.log(`   İlk 3 Hane: ${config.threeDigits || "Otomatik"}`);
    console.log(`   Son 4 Hane: ${config.fourDigits || "Otomatik"}`);
    console.log(`   Tarama Sayısı: ${config.limit}`);
    console.log(`   Başlangıç: ${config.startFrom}`);
    console.log(`   Gecikme: ${config.delay}ms\n`);

    // Dosya başlığı (ilk kez çalışıyorsa)
    if (!resumed) {
        const header = `VODAFONE NUMARA TARAMA SONUÇLARI\nTarih: ${new Date().toLocaleString(
            "tr-TR",
        )}\nAyarlar: ${config.threeDigits || "Auto"}XXXX, Limit: ${
            config.limit
        }\n${"=".repeat(60)}\n`;
        fs.writeFileSync("numaralar.txt", header, "utf8");
    }

    console.log("🔍 Tarama başlatılıyor...\n");

    let foundCount = 0;
    let errorCount = 0;
    let goldCount = 0;

    for (let i = 0; i < config.limit; i++) {
        const digits = generateNumber(i);
        const currentNumber = i + 1;

        console.log(
            `🔍 Taranıyor: ${digits} (${currentNumber}/${config.limit})`,
        );

        const numbers = await checkNumber(digits);

        if (numbers !== null) {
            // Sonuçları kaydet
            saveResult(digits, numbers);

            if (numbers.length > 0) {
                foundCount += numbers.length;

                // Gold sayısını say
                const golds = numbers.filter((n) => n.msisdnType === "GOLD");
                goldCount += golds.length;

                console.log(`✅ ${numbers.length} numara bulundu:`);
                numbers.forEach((num) => {
                    const type = num.msisdnType === "GOLD" ? "💎" : "📱";
                    console.log(
                        `   ${type} ${num.msisdn} (${num.specialNumberPrice}₺)`,
                    );
                });
            } else {
                console.log("ℹ️  Bu aramada numara yok");
            }
        } else {
            errorCount++;
            saveResult(digits, []);
            console.log("❌ API hatası");

            // wait 5 min
            console.log("⏳ 5 dakika bekleniyor...");
            await new Promise((resolve) => setTimeout(resolve, 300000));
            continue; // Hata durumunda ilerleme kaydetmeden devam et
        }

        // Progress kaydet
        saveProgress(i);

        // İlerleme durumu
        if (currentNumber % 10 === 0) {
            const successRate = (
                ((currentNumber - errorCount) / currentNumber) *
                100
            ).toFixed(1);
            console.log(
                `\n📊 İlerleme: ${currentNumber}/${config.limit} | Bulunan: ${foundCount} (${goldCount} GOLD) | Başarı: ${successRate}% | Hata: ${errorCount}\n`,
            );
        }

        // Son tarama değilse bekle
        if (i < config.limit - 1) {
            await new Promise((resolve) => setTimeout(resolve, config.delay));
        }
    }

    // Final raporu
    console.log("\n🎉 Tarama Tamamlandı!");
    console.log(`📊 Toplam Tarama: ${config.limit}`);
    console.log(
        `✅ Bulunan Numara: ${foundCount} (${goldCount} GOLD, ${
            foundCount - goldCount
        } PLAIN)`,
    );
    console.log(`❌ Hata Sayısı: ${errorCount}`);
    console.log(`📁 Sonuçlar: numaralar.txt`);
    console.log(`📊 Progress: progress.json\n`);

    // Final özeti dosyaya ekle
    const summary = `\n${"=".repeat(
        60,
    )}\nTARAMA ÖZETİ - ${new Date().toLocaleString("tr-TR")}\n${"=".repeat(
        60,
    )}\n`;
    const stats = `Toplam Taranan: ${
        config.limit
    }\nBulunan Numara: ${foundCount} (${goldCount} GOLD, ${
        foundCount - goldCount
    } PLAIN)\nBaşarı Oranı: ${(
        ((config.limit - errorCount) / config.limit) *
        100
    ).toFixed(1)}%\nHata Sayısı: ${errorCount}\n`;
    fs.appendFileSync("numaralar.txt", summary + stats);
}

// Komut satırı yardımı
if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
🚀 Vodafone Numara Tarayıcı
    
Kullanım:
    node vodafone.js                 # Normal başlat
    node vodafone.js --devam         # Kaldığın yerden devam et
    node vodafone.js --help          # Bu yardımı göster

Ayarlar script içinde config objesinde yapılır.
    `);
    process.exit(0);
}

// Script'i başlat
main().catch(console.error);
