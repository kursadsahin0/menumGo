export const termsVersion = '2026-10-09'

export const legalDocuments = {
  terms: {
    title: 'Kullanım koşulları',
    description: 'menümGo hesabı ve dijital menünün kullanım koşulları.',
    sections: [
      {
        heading: 'Hizmet',
        paragraphs: [
          'menümGo, kafeler, restoranlar ve barlar için dijital QR menü panelidir. Misafir kodu okutur ve menüyü telefonunda görür. Menüden sipariş verilmez ve ödeme alınmaz.',
          'Kayıt, 7 günlük deneme başlatır. Bu sürede panel ve misafir menüsü açıktır. Süre bitince panel, satın alma tamamlanana kadar kapalı kalır.',
        ],
      },
      {
        heading: 'Hesap',
        paragraphs: [
          'Hesabı işletmeyi temsil eden kişi açar. Kayıtta ad, işletme adı, e-posta, telefon ve şifre istenir. E-posta doğrulanmadan panele girilmez.',
          'Şifre size aittir. Çıkış, o oturumun jetonunu geçersiz kılar. Şifre değişince diğer oturumlar kapanır.',
        ],
      },
      {
        heading: 'Menü içeriği',
        paragraphs: [
          'Ürün adı, fiyat, içerik, alerjen, görsel ve işletme bilgisi size aittir. Fiyatın ve alerjen bilgisinin doğruluğundan siz sorumlusunuz.',
          'Deneme sürerken ve satın alma tamamlanınca menü ziyaretçiye açıktır. Deneme bitince menü kapanır. Kapatılmış masa, QR ile menü açmaz.',
        ],
      },
      {
        heading: 'Kabul',
        paragraphs: [
          `Kayıttaki onay, ${termsVersion} sürümündeki kullanım koşullarını, gizlilik bildirimini ve KVKK aydınlatma metnini birlikte kabul eder. Metin değişince sürüm değişir; yeni kayıt güncel sürümü kabul eder.`,
        ],
      },
    ],
  },
  privacy: {
    title: 'Gizlilik bildirimi',
    description: 'menümGo hesabında ve misafir menüsünde işlenen veriler.',
    sections: [
      {
        heading: 'Hesap verisi',
        paragraphs: [
          'Kayıtta ad, e-posta, telefon ve işletme adı alınır. Şifre düz metin tutulmaz. Oturum, tarayıcıdaki jetonla sürer ve çıkışta silinir.',
          'E-posta, hesabı doğrulamak ve şifre sıfırlamak için kullanılır. Posta gönderilemezse hesap açılmaz ve sıfırlama bağlantısı üretilmez.',
        ],
      },
      {
        heading: 'Menü ve görsel',
        paragraphs: [
          'Menü metni, fiyat, alerjen ve yüklenen görsel, menüyü yayınlamak için saklanır. Görsel, kayıttan önce küçültülür ve veritabanında durur.',
          'Wi-Fi şifresi şifreli saklanır. Misafir menüsü şifreyi kendiliğinden göstermez; şifre ayrı bir istekle çözülür.',
        ],
      },
      {
        heading: 'Misafir',
        paragraphs: [
          'Misafirden ad, telefon veya ödeme bilgisi alınmaz. Menü ve ürün görüntülemeleri dil, masa ve zaman bilgisiyle tutulur. Bu kayıtlar 90 gün sonra silinir.',
          'Garson çağrısı, işletmenin paneline ve izin verilmişse tarayıcı bildirimine gider. Çağrı, masa adıyla sınırlıdır.',
        ],
      },
      {
        heading: 'Saklama',
        paragraphs: [
          'Hesap ve menü verisi, hesap durdukça saklanır. Görüntüleme kayıtları 90 günü aşınca silinir. Oturum jetonu en çok 7 gün geçerlidir.',
        ],
      },
    ],
  },
  kvkk: {
    title: 'KVKK aydınlatma metni',
    description: '6698 sayılı Kanun kapsamında menümGo aydınlatma metni.',
    sections: [
      {
        heading: 'Veri sorumlusu',
        paragraphs: [
          'Veri sorumlusu, menümGo hizmetini işleten taraftır. Başvuru kanalı, iletişim sayfasındaki abonelik hattıdır: 0555 123 45 67.',
        ],
      },
      {
        heading: 'İşlenen veriler ve amaç',
        paragraphs: [
          'Kimlik ve iletişim: ad, e-posta, telefon. İşletme: işletme adı ve menü içeriği. İşlem güvenliği: parola özeti, oturum ve hız sınırı kayıtları.',
          'Amaç, hesabı açmak, menüyü yayınlamak, aboneliği yürütmek, doğrulama postası göndermek ve görüntüleme istatistiği tutmaktır.',
        ],
      },
      {
        heading: 'Hukuki sebep',
        paragraphs: [
          'Hesabı açmak ve menüyü sunmak sözleşmenin kurulması ve ifasıdır. Hız sınırı, oturumun kapatılması ve 90 günlük istatistik meşru menfaate dayanır.',
          'Hesap için zorunlu veriler açık rızaya bağlanmaz. Garson bildirimi, tarayıcının verdiği ayrı izne bağlıdır. Kayıttaki kutu, bu aydınlatma metninin okunduğunu ve kullanım koşullarının kabul edildiğini gösterir.',
        ],
      },
      {
        heading: 'Haklar',
        paragraphs: [
          'KVKK m. 11 kapsamındaki talepler abonelik hattına iletilir. Talep, kayıtlı e-posta adresi belirtilerek yapılır.',
          `Bu metin ${termsVersion} sürümlüdür. Kayıt, bu sürümün kabul edildiğini hesapta saklar.`,
        ],
      },
    ],
  },
}
