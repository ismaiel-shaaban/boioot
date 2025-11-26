'use client';

import { useState, useEffect } from 'react';
import { communityService } from '@/lib/services/community';
import { showToast } from '@/lib/utils/toast';
import styles from './AdPost.module.css';

interface AdPostProps {
  post?: any;
  onChangeTab?: () => void;
}

export default function AdPost({ post, onChangeTab }: AdPostProps) {
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    file: null as File | null,
  });
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [coverMediaUrl, setCoverMediaUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    getCommunities();
    if (post) {
      getPostById();
    } else {
      resetForm();
    }
  }, [post]);

  const getPostById = async () => {
    setIsLoading(true);
    try {
      setPostId(post?.Id);
      setNewPost({
        title: post?.Title || '',
        content: post?.Content || '',
        category: post?.CategoryId || '',
        file: null,
      });
      setSelectedCommunity(post?.CategoryId || '');
      setCoverMediaUrl(post?.CoverMediaUrl || null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCommunities = async () => {
    try {
      const response = await communityService.getCategories(0);
      if (response?.IsSuccess || response?.Success) {
        const data = response?.Data;
        const communitiesData = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.Items)
            ? (data as any).Items
            : [];
        setCommunities(communitiesData);
      } else {
        showToast(response?.Error || 'تعذر الحصول على المجتمعات', 'error');
      }
    } catch (error: any) {
      console.error('Error loading communities:', error);
      showToast('حدث خطأ أثناء تحميل المجتمعات', 'error');
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPost({ ...newPost, file });
      setCoverMediaUrl(URL.createObjectURL(file));
    }
  };

  const saveChange = async () => {
    if (!post) {
      await addNewPost();
    } else {
      await updatePost();
    }
  };

  const addNewPost = async () => {
    if (!newPost.title || !newPost.content || !selectedCommunity) {
      showToast('من فضلك أدخل جميع الحقول المطلوبة', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let coverMediaId: string | null = null;
      if (newPost.file) {
        const uploadResponse = await communityService.uploadUserPost(newPost.file);
        if (uploadResponse?.IsSuccess || uploadResponse?.Success) {
          const uploadData = uploadResponse?.Data as any || {};
          coverMediaId = uploadData?.Id || null;
        } else {
          showToast(uploadResponse?.Error || 'فشل في رفع الصورة', 'error');
          setIsLoading(false);
          return;
        }
      }

      const addResponse = await communityService.addPost(
        newPost.title,
        newPost.content,
        selectedCommunity,
        coverMediaId
      );

      if (addResponse?.IsSuccess || addResponse?.Success) {
        showToast(addResponse?.Message || 'تم إضافة المقال بنجاح', 'success');
        resetForm();
        setPostId(null);
        onChangeTab?.();
      } else {
        showToast(addResponse?.Error || 'فشل في إضافة المقال', 'error');
      }
    } catch (error: any) {
      console.error('Error adding post:', error);
      showToast('حدث خطأ أثناء إضافة المقال', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async () => {
    if (!newPost.title || !newPost.content || !selectedCommunity || !postId) {
      showToast('من فضلك أدخل جميع الحقول المطلوبة', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let coverMediaId: string | null = null;
      if (newPost.file) {
        const uploadResponse = await communityService.uploadUserPost(newPost.file);
        if (uploadResponse?.IsSuccess || uploadResponse?.Success) {
          const uploadData = uploadResponse?.Data as any || {};
          coverMediaId = uploadData?.Id || null;
        } else {
          showToast(uploadResponse?.Error || 'فشل في رفع الصورة', 'error');
          setIsLoading(false);
          return;
        }
      }

      const updateResponse = await communityService.updateCommunityPost(
        postId,
        newPost.title,
        newPost.content,
        selectedCommunity,
        coverMediaId
      );

      if (updateResponse?.IsSuccess || updateResponse?.Success) {
        showToast(updateResponse?.Message || 'تم تحديث المقال بنجاح', 'success');
        resetForm();
        setPostId(null);
        onChangeTab?.();
      } else {
        showToast(updateResponse?.Error || 'فشل في تحديث المقال', 'error');
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      showToast('حدث خطأ أثناء تحديث المقال', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewPost({
      title: '',
      content: '',
      category: '',
      file: null,
    });
    setSelectedCommunity('');
    setCoverMediaUrl(null);
  };

  const cancel = () => {
    resetForm();
    setPostId(null);
    onChangeTab?.();
  };

  const isFormValid = newPost.title && newPost.content && selectedCommunity;

  return (
    <div className={styles.adPostTab}>
      <h3 className={styles.sectionTitle} aria-label={!post ? 'إضافة مقال جديد' : 'تعديل المقال'}>
        {!post ? 'إضافة مقال جديد' : 'تعديل المقال'}
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveChange();
        }}
        className={styles.rtlForm}
        aria-label="نموذج إضافة أو تعديل مقال"
      >
        <div className="form-floating mb-3">
          <input
            type="text"
            id="title"
            className="form-control text-right"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="عنوان المقال"
            required
            aria-label="عنوان المقال"
          />
          <label htmlFor="title" className="text-right">
            عنوان المقال
          </label>
        </div>

        <div className={styles.selectWrapper}>
          <div className={styles.customSelectContainer}>
            <select
              id="communitySelect"
              className="text-right"
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              required
              aria-label="اختر المجتمع"
            >
              <option value="" disabled>
                اختر المجتمع
              </option>
              {communities.map((community) => (
                <option key={community.Id} value={community.Id}>
                  {community.Name}
                </option>
              ))}
            </select>

            <div className={styles.selectIcon}>
              <i className={`fas fa-arrow-${isOpen ? 'up' : 'down'} ${styles.greenColor}`}></i>
            </div>
          </div>
        </div>

        <div className="form-floating mb-3">
          <textarea
            id="content"
            className={`form-control textarea text-right ${styles.textarea}`}
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="محتوى المقال"
            required
            rows={10}
            aria-label="محتوى المقال"
          ></textarea>
          <label htmlFor="content" className="text-right">
            محتوى المقال
          </label>
        </div>

        {coverMediaUrl && (
          <div className={`${styles.blogImage} mb-3`}>
            <img src={coverMediaUrl} alt="post image" className="img-fluid rounded" loading="lazy" aria-label="صورة المقال" />
          </div>
        )}

        <div className="form-floating mb-3">
          <div className={styles.fileUploadArea}>
            <input
              type="file"
              id="licenseFile"
              className={styles.fileInput}
              onChange={onFileSelected}
              accept=".pdf,.jpg,.jpeg,.png"
              placeholder="اختر صورة"
              aria-label="رفع صورة أو ملف"
            />
            <label className="text-right">اختر رفع صورة</label>
            <label htmlFor="licenseFile" className={styles.fileUploadButton} aria-label="زر رفع صورة">
              <i className="fas fa-upload"></i>
            </label>
            {newPost.file && <div className={`${styles.fileName} text-right`}>{newPost.file.name}</div>}
          </div>
        </div>

        <div className={`${styles.formActions} text-right`}>
          <button type="submit" className={`btn ${styles.btnSave}`} disabled={!isFormValid || isLoading} aria-label="حفظ المقال">
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" className={`btn ${styles.btnCancel}`} onClick={cancel} aria-label="إلغاء">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
