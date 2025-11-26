import {
  ProjectBasicInfo,
  ProjectLocation,
  ProjectFeatures,
  ProjectWarranty,
  UnitBasicInfo,
  UnitOwnerInfo,
  UnitInformation,
  UnitDetails,
  ValidationResult,
} from '@/lib/core/models/projects.models';

export const validationService = {
  validateProjectBasicInfo(data: ProjectBasicInfo): ValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push('اسم المشروع مطلوب ويجب أن يكون 3 أحرف على الأقل');
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push('وصف المشروع مطلوب ويجب أن يكون 10 أحرف على الأقل');
    }

    if (!data.unitsCount || data.unitsCount <= 0) {
      errors.push('عدد الوحدات مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (!data.unitType) {
      errors.push('نوع الوحدات مطلوب');
    }

    if (!data.priceFrom || data.priceFrom <= 0) {
      errors.push('السعر من مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (!data.priceTo || data.priceTo <= 0) {
      errors.push('السعر إلى مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (data.priceFrom && data.priceTo && data.priceFrom > data.priceTo) {
      errors.push('السعر من يجب أن يكون أقل من السعر إلى');
    }

    if (!data.areaFrom || data.areaFrom <= 0) {
      errors.push('المساحة من مطلوبة ويجب أن تكون أكبر من صفر');
    }

    if (!data.areaTo || data.areaTo <= 0) {
      errors.push('المساحة إلى مطلوبة ويجب أن تكون أكبر من صفر');
    }

    if (data.areaFrom && data.areaTo && data.areaFrom > data.areaTo) {
      errors.push('المساحة من يجب أن تكون أقل من المساحة إلى');
    }

    if (!data.status) {
      errors.push('حاله الوحدات مطلوبه');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateProjectLicense(license: File | null): ValidationResult {
    const errors: string[] = [];

    if (!license) {
      errors.push('رخصة المشروع مطلوبة');
      return {
        isValid: false,
        errors,
      };
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(license.type)) {
      errors.push('يجب أن يكون الملف من نوع PDF أو صورة');
    }

    if (license.size > 5 * 1024 * 1024) {
      errors.push('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateProjectLocation(data: ProjectLocation): ValidationResult {
    const errors: string[] = [];

    if (!data.city || data.city.trim().length === 0) {
      errors.push('المدينة مطلوبة');
    }

    if (!data.district || data.district.trim().length === 0) {
      errors.push('الحي مطلوب');
    }

    if (!data.street || data.street.trim().length === 0) {
      errors.push('الشارع مطلوب');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateProjectFeatures(data: ProjectFeatures): ValidationResult {
    const errors: string[] = [];

    if (!data.features || data.features.length === 0) {
      errors.push('يجب اختيار مميزة واحدة على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateProjectWarranty(data: ProjectWarranty): ValidationResult {
    const errors: string[] = [];

    if (!data.constructionYears || data.constructionYears <= 0) {
      errors.push('سنوات الضمان الإنشائي مطلوبة ويجب أن تكون أكبر من صفر');
    }

    if (!data.electricalYears || data.electricalYears <= 0) {
      errors.push('سنوات الضمان الكهربائي مطلوبة ويجب أن تكون أكبر من صفر');
    }

    if (!data.plumbingYears || data.plumbingYears <= 0) {
      errors.push('سنوات الضمان الصحي مطلوبة ويجب أن تكون أكبر من صفر');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateProjectMedia(images: File[], videos: File[]): ValidationResult {
    const errors: string[] = [];

    if (!images || images.length === 0) {
      errors.push('يجب رفع صورة واحدة على الأقل');
    }

    if (images && images.length > 10) {
      errors.push('يمكن رفع 10 صور كحد أقصى');
    }

    if (videos && videos.length > 5) {
      errors.push('يمكن رفع 5 فيديوهات كحد أقصى');
    }

    if (images) {
      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          errors.push('يجب أن تكون الملفات المرفوعة صور');
          break;
        }
        if (image.size > 5 * 1024 * 1024) {
          errors.push('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
          break;
        }
      }
    }

    if (videos) {
      for (const video of videos) {
        if (!video.type.startsWith('video/')) {
          errors.push('يجب أن تكون الملفات المرفوعة فيديوهات');
          break;
        }
        if (video.size > 50 * 1024 * 1024) {
          errors.push('حجم الفيديو يجب أن يكون أقل من 50 ميجابايت');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateUnitBasicInfo(data: UnitBasicInfo): ValidationResult {
    const errors: string[] = [];

    if (!data.Title || data.Title.trim().length < 3) {
      errors.push('عنوان الوحدة مطلوب ويجب أن يكون 3 أحرف على الأقل');
    }

    if (!data.Description || data.Description.trim().length < 10) {
      errors.push('وصف الوحدة مطلوب ويجب أن يكون 10 أحرف على الأقل');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateUnitOwnerInfo(data: UnitOwnerInfo): ValidationResult {
    const errors: string[] = [];

    if (!data.ownerType) {
      errors.push('نوع المالك مطلوب');
    }

    if (!data.ownerName || data.ownerName.trim().length < 3) {
      errors.push('اسم المالك مطلوب ويجب أن يكون 3 أحرف على الأقل');
    }

    if (!data.establishmentDate || data.establishmentDate.trim().length === 0) {
      errors.push('تاريخ التأسيس مطلوب للشركات');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateUnitInformation(data: UnitInformation): ValidationResult {
    const errors: string[] = [];

    if (!data.area || data.area <= 0) {
      errors.push('المساحة مطلوبة ويجب أن تكون أكبر من صفر');
    }

    if (!data.price || data.price <= 0) {
      errors.push('السعر مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (data.hasCommission && (!data.commissionAmount || data.commissionAmount <= 0)) {
      errors.push('مبلغ العمولة مطلوب عند تفعيل العمولة');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateUnitDetails(data: UnitDetails): ValidationResult {
    const errors: string[] = [];

    if (!data.numberOfRooms || data.numberOfRooms <= 0) {
      errors.push('عدد الغرف مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (!data.numberOfHalls || data.numberOfHalls <= 0) {
      errors.push('عدد الصالات مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (!data.numberOfBathrooms || data.numberOfBathrooms <= 0) {
      errors.push('عدد الحمامات مطلوب ويجب أن يكون أكبر من صفر');
    }

    if (!data.category || data.category <= 0) {
      errors.push('فئة الوحدة مطلوبة');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateRequired(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return `${fieldName} مطلوب`;
    }
    return null;
  },

  validateMinLength(value: string, minLength: number, fieldName: string): string | null {
    if (value && value.trim().length < minLength) {
      return `${fieldName} يجب أن يكون ${minLength} أحرف على الأقل`;
    }
    return null;
  },

  validateNumberRange(value: number, min: number, max: number, fieldName: string): string | null {
    if (value < min || value > max) {
      return `${fieldName} يجب أن يكون بين ${min} و ${max}`;
    }
    return null;
  },

  validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return 'البريد الإلكتروني غير صحيح';
    }
    return null;
  },

  validatePhone(phone: string): string | null {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (phone && !phoneRegex.test(phone)) {
      return 'رقم الهاتف غير صحيح';
    }
    return null;
  },
};

export const validateEnglishNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const englishNumberRegex = /[0-9.]/;
  if (!englishNumberRegex.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
    e.preventDefault();
  }
};

