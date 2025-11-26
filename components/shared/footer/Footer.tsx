'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const mainSections = [
    { name: 'الرئيسية', link: '/home' },
    { name: 'الطلبات', link: '/requests' },
    { name: 'المشاريع العقارية', link: '/projects' },
    { name: 'مجتمع بيوت', link: '/community' },
    { name: 'المدونة', link: '/blogs' },
  ];

  const adSections = [
    { name: 'الاعلانات', link: '/ads' },
    { name: 'الإيجار', link: '/daily-rent' },
    { name: 'طلب تسويق', link: '/add-special-order' },
    { name: 'طلب عقار', link: '/add-request' },
  ];

  const quickLinks = [
    { name: 'اضافة اعلان', link: '/add-advertistment' },
    { name: 'اضافة تاجير يومي', link: '/add-daily-rent' },
    { name: 'اتصل بنا', link: '/contact-us' },
    { name: 'سياسة الموقع', link: '/privacy-policy' },
    { name: 'الشروط والأحكام', link: '/terms-conditions' },
  ];

  const socialMedia = [
    {
      name: 'youtube',
      icon: 'fab fa-youtube',
      link: 'https://youtube.com/@boioot?si=lZ1Cd6W3vy_uahs5',
      color: '#ff0000',
    },
    {
      name: 'instagram',
      icon: 'fab fa-instagram',
      link: 'https://www.instagram.com/boiootsyr?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      color: '#e1306c',
    },
    {
      name: 'facebook',
      icon: 'fab fa-facebook-f',
      link: 'https://www.facebook.com/boi0ot',
      color: '#1877f2',
    },
    {
      name: 'snapchat',
      icon: 'fab fa-snapchat-ghost',
      link: 'https://www.snapchat.com/add/boioot?share_id=raYjR5dOv-k&locale=ar-EG',
      color: '#fffc00',
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className="row">
            {/* Social Media content*/}
            <div className="col-md-4 col-sm-6 footer-column">
              <div className={styles.socialMediaContainer}>
                <div className={styles.logoContainer}>
                  <img src="/assets/images/Boioot-logoo.png" alt="Boioot Logo" className={styles.footerLogo} />
                  <p className={styles.footerDescription}>موقع Boioot هو موقع عقاري يساعدك في البحث عن العقارات والتواصل مع الملاك بأبسط الطرق.</p>
                </div>
                <div className={styles.socialMedia}>
                  {socialMedia.map((social) => (
                    <a
                      key={social.name}
                      href={social.link}
                      target="_blank"
                      className={styles.socialIcon}
                      style={{ backgroundColor: 'rgb(40 167 69)' }}
                      aria-label={`زيارة صفحة ${social.name} على وسائل التواصل الاجتماعي`}
                      rel="noopener noreferrer"
                    >
                      <i className={social.icon} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="col-md-3 col-sm-6 footer-column">
              <h3 className={styles.footerTitle}>الأقسام الرئيسية</h3>
              <ul className={styles.footerLinks}>
                {mainSections.map((section) => (
                  <li key={section.link}>
                    <Link href={section.link} aria-label={`انتقل إلى ${section.name}`}>
                      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                      {section.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ad Sections */}
            <div className="col-md-3 col-sm-6 footer-column">
              <h3 className={styles.footerTitle}>أقسام الإعلانات</h3>
              <ul className={styles.footerLinks}>
                {adSections.map((section) => (
                  <li key={section.link}>
                    <Link href={section.link} aria-label={`انتقل إلى ${section.name}`}>
                      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                      {section.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div className="col-md-2 col-sm-6 footer-column">
              <h3 className={styles.footerTitle}>الروابط السريعة</h3>
              <ul className={styles.footerLinks}>
                {quickLinks.map((link) => (
                  <li key={link.link}>
                    <Link href={link.link} aria-label={`انتقل إلى ${link.name}`}>
                      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <hr className={styles.footerHr} />

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className="container">
          <p>حقوق التصميم محفوظة لدى Boioot</p>
        </div>
      </div>
    </footer>
  );
}

