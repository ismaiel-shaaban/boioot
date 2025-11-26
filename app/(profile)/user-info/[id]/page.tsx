import { Metadata } from 'next';
import { advertisementService } from '@/lib/services/advertisement';
import { specialOrderService } from '@/lib/services/special-order';
import { dailyRentService } from '@/lib/services/daily-rent';
import UserInfoClient from '@/components/pages/user-info/UserInfoClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Try to get user info from ads
    const payload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 1,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: params.id,
    };

    const response = await advertisementService.getAdvertisementsByUserId(payload);
    if (response?.IsSuccess && response?.Data) {
      const data = response.Data as any;
      if (data?.Items?.length > 0) {
        const firstItem = data.Items[0];
        const userName = firstItem?.UserfFullName || firstItem?.RequesterName || '';
        if (userName) {
          return getMetadata({
            title: `${userName} | معلومات المستخدم | بوابة العقارات`,
            description: 'صفحة معلومات المستخدم في بوابة العقارات، استعرض بيانات المستخدم الشخصية.',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return getMetadata({
    title: 'معلومات المستخدم | بوابة العقارات',
    description: 'صفحة معلومات المستخدم في بوابة العقارات، استعرض بيانات المستخدم الشخصية.',
  });
}

export default async function UserInfoPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  let ads: any[] = [];
  let rents: any[] = [];
  let orders: any[] = [];
  let userInfo: any = null;

  try {
    const adsPayload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: userId,
    };

    const rentsPayload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: userId,
    };

    const ordersPayload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      userId: userId,
    };

    const [adsResponse, rentsResponse, ordersResponse] = await Promise.all([
      advertisementService.getAdvertisementsByUserId(adsPayload),
      dailyRentService.getAdvertisementsByUserId(rentsPayload),
      specialOrderService.getAdvertisementsByUserId(ordersPayload),
    ]);

    if (adsResponse?.IsSuccess) {
      const adsData = adsResponse.Data as any;
      ads = adsData?.Items || [];
    }
    if (rentsResponse?.IsSuccess) {
      const rentsData = rentsResponse.Data as any;
      rents = rentsData?.Items || [];
    }
    if (ordersResponse?.IsSuccess) {
      const ordersData = ordersResponse.Data as any;
      orders = ordersData?.Items || [];
    }

    // Extract user info from first available item
    const firstItem = ads[0] || rents[0] || orders[0];
    if (firstItem) {
      userInfo = {
        UserFullName: firstItem?.UserfFullName || firstItem?.RequesterName || '',
        UserProfileImageUrl: firstItem?.UserProfileImageUrl || firstItem?.RequesterImageUrl || null,
        IsVerified: firstItem?.IsVerified || false,
        LastSeen: firstItem?.LastSeen || 'لا يوجد',
        UserPhoneNumber: firstItem?.UserPhoneNumber || firstItem?.RequesterPhone || '',
      };
    }
  } catch (error: any) {
    console.error('Error loading user info:', error);
  }

  return (
    <UserInfoClient
      userId={userId}
      initialAds={ads}
      initialRents={rents}
      initialOrders={orders}
      initialUserInfo={userInfo}
    />
  );
}

