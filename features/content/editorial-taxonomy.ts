export type EditorialTopicId =
  | 'space-planning'
  | 'ecommerce'
  | 'inventory'
  | 'business'
  | 'personal';

export type EditorialVisualKey =
  | 'ruler'
  | 'picking'
  | 'flow'
  | 'workspace'
  | 'abc'
  | 'home';

export type EditorialProfile = {
  topic: EditorialTopicId;
  visualKey: EditorialVisualKey;
  mark: string;
  labelVi: string;
  labelEn: string;
  questionVi: string;
  questionEn: string;
};

const fallbackProfile: EditorialProfile = {
  topic: 'space-planning',
  visualKey: 'ruler',
  mark: 'N',
  labelVi: 'Hướng dẫn không gian',
  labelEn: 'Space guide',
  questionVi: 'Bài viết giúp bạn ra quyết định sử dụng không gian rõ ràng hơn.',
  questionEn: 'This article helps you make a clearer space-use decision.'
};

const profiles: Record<string, EditorialProfile> = {
  'chon-dien-tich-kho-mini': {
    topic: 'space-planning',
    visualKey: 'ruler',
    mark: 'M²',
    labelVi: 'Chọn diện tích',
    labelEn: 'Space sizing',
    questionVi: 'Cần bao nhiêu diện tích để vừa chứa được đồ vừa còn thao tác được?',
    questionEn: 'How much space do you need to store items and still operate comfortably?'
  },
  'sap-xep-kho-shop-online': {
    topic: 'ecommerce',
    visualKey: 'picking',
    mark: 'SKU',
    labelVi: 'Shop online',
    labelEn: 'Online selling',
    questionVi: 'Bố trí hàng thế nào để lấy nhanh mà không biến kho nhỏ thành một mê cung?',
    questionEn: 'How do you arrange stock for fast picking without turning a small unit into a maze?'
  },
  'kho-cho-shop-online-tu-nha-ra-kho-rieng': {
    topic: 'ecommerce',
    visualKey: 'flow',
    mark: '→',
    labelVi: 'Tách hàng khỏi nhà',
    labelEn: 'Move stock out of home',
    questionVi: 'Khi nào tồn kho đã đủ lớn để cần một không gian riêng?',
    questionEn: 'When has inventory grown enough to deserve its own space?'
  },
  'kho-hay-mo-rong-van-phong': {
    topic: 'business',
    visualKey: 'workspace',
    mark: 'B2B',
    labelVi: 'Không gian doanh nghiệp',
    labelEn: 'Business space',
    questionVi: 'Nên trả tiền cho thêm diện tích văn phòng hay tách phần lưu trữ ra riêng?',
    questionEn: 'Should you pay for more office area or separate storage from the workspace?'
  },
  'quan-ly-hang-ton-cham-luan-chuyen': {
    topic: 'inventory',
    visualKey: 'abc',
    mark: 'ABC',
    labelVi: 'Quản trị tồn kho',
    labelEn: 'Inventory control',
    questionVi: 'Hàng nào xứng đáng chiếm vị trí tốt và hàng nào đang khóa cả vốn lẫn diện tích?',
    questionEn: 'Which stock deserves premium access and which stock is tying up cash and space?'
  },
  'kho-ca-nhan-chuyen-nha-sua-nha': {
    topic: 'personal',
    visualKey: 'home',
    mark: 'HOME',
    labelVi: 'Kho cá nhân',
    labelEn: 'Personal storage',
    questionVi: 'Xếp đồ thế nào để vài tuần sau vẫn lấy đúng món mình cần?',
    questionEn: 'How do you pack belongings so you can still retrieve the right item weeks later?'
  }
};

const topicCopy: Record<EditorialTopicId, {vi: string; en: string}> = {
  'space-planning': {vi: 'Chọn diện tích', en: 'Space planning'},
  ecommerce: {vi: 'Shop online', en: 'E-commerce'},
  inventory: {vi: 'Tồn kho', en: 'Inventory'},
  business: {vi: 'Doanh nghiệp', en: 'Business'},
  personal: {vi: 'Cá nhân', en: 'Personal'}
};

export function getEditorialProfile(slug: string): EditorialProfile {
  return profiles[slug] ?? fallbackProfile;
}

export function getEditorialTopicLabel(topic: EditorialTopicId, locale: 'vi' | 'en') {
  return topicCopy[topic][locale];
}

export function getEditorialTopicOptions(locale: 'vi' | 'en') {
  return (Object.keys(topicCopy) as EditorialTopicId[]).map(id => ({
    id,
    label: topicCopy[id][locale]
  }));
}

export function rankRelatedEditorial<T extends {slug: string}>(
  posts: T[],
  currentSlug: string
): T[] {
  const currentTopic = getEditorialProfile(currentSlug).topic;

  return posts
    .filter(post => post.slug !== currentSlug)
    .map((post, index) => ({
      post,
      index,
      sameTopic: getEditorialProfile(post.slug).topic === currentTopic
    }))
    .sort((a, b) => Number(b.sameTopic) - Number(a.sameTopic) || a.index - b.index)
    .map(item => item.post);
}
