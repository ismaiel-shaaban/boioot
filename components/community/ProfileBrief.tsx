'use client';

import styles from './ProfileBrief.module.css';

interface ProfileBriefProps {
  name: string;
  avatar: string;
  lastSeen: string;
  stats: { posts: number; replies: number };
  memberSince: string;
}

export default function ProfileBrief({ name, avatar, lastSeen, stats, memberSince }: ProfileBriefProps) {
  return (
    <div className={styles.container} aria-label="معلومات المستخدم المختصرة">
      <div className="row">
        <div className="col-md-12">
          <div className={`${styles.profileCard} text-center`} aria-label="بطاقة المستخدم">
            <div className={styles.profileAvatar}>
              <img
                src={avatar || '/assets/images/blank-profile.png'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                }}
                alt={name}
                loading="lazy"
                aria-label="صورة المستخدم"
              />
            </div>
            <h3 className={styles.profileName} aria-label="اسم المستخدم">
              {name}
            </h3>
            <div className={`${styles.profileStats} d-flex mt-3`} aria-label="إحصائيات المستخدم">
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.posts} مقالة</span>
                <span className={`${styles.statIcon} ${styles.likesIcon}`}></span>
              </div>
              |
              <div className={styles.statItem}>
                <span className={styles.statValue}>{stats.replies} تعليق</span>
                <span className={`${styles.statIcon} ${styles.viewsIcon}`}></span>
              </div>
            </div>
            <p className={styles.profileMemberSince} aria-label="آخر ظهور">
              اخر ظهور من {memberSince}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

