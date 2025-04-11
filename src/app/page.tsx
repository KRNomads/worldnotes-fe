import React from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            WorldNote
          </Link>
          <Link href="/login" className={styles.loginButton}>
            로그인
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heading}>
            스토리생성을위한 AI
            <br />
            World Note
          </h1>
          <p className={styles.subheading}>
            웹소설 AI 창작툴 World Note
            <br />
            활용해보세요!
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/terms" className={styles.button}>
              이용약관
            </Link>
            <Link href="/info" className={styles.button}>
              제품안내
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <h2 className={styles.infoHeading}>
          월드노트는 작가님들을 위한 AI툴입니다
        </h2>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link href="/terms" className={styles.footerLink}>
            서비스 이용약관
          </Link>
          <span className={styles.divider}>|</span>
          <Link href="/privacy" className={styles.footerLink}>
            개인정보 처리방침
          </Link>
        </div>
      </footer>
    </div>
  );
}
