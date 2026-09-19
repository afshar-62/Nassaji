export interface CategorySeedDefinition {
  slug: string;
  titleFa: string;
  titleEn: string;
  icon?: string;
  description?: string;
  displayOrder: number;
  children?: Array<{
    slug: string;
    titleFa: string;
    titleEn: string;
    icon?: string;
    description?: string;
    displayOrder: number;
  }>;
}

export const TEXTILE_TAXONOMY_SEEDS: CategorySeedDefinition[] = [
  {
    slug: 'raw-materials',
    titleFa: 'مواد اولیه',
    titleEn: 'Raw Materials',
    icon: 'Layers',
    description: 'انواع الیاف طبیعی، مصنوعی و مواد پتروشیمی پایه صنعت نساجی',
    displayOrder: 1,
    children: [
      { slug: 'cotton', titleFa: 'پنبه', titleEn: 'Cotton', icon: 'Flower', description: 'انواع وش و محلوج پنبه مرغوب داخلی و وارداتی', displayOrder: 1 },
      { slug: 'wool', titleFa: 'پشم', titleEn: 'Wool', icon: 'Cloud', description: 'پشم خام و شسته شده گوسفندی و مرینوس', displayOrder: 2 },
      { slug: 'silk', titleFa: 'ابریشم', titleEn: 'Silk', icon: 'Sparkles', description: 'پیله ابریشم و الیاف طبیعی ابریشمی', displayOrder: 3 },
      { slug: 'leather', titleFa: 'چرم', titleEn: 'Leather', icon: 'Shield', description: 'چرم طبیعی خام، نیمه‌ساخته و دباغی شده', displayOrder: 4 },
      { slug: 'synthetic-fibers', titleFa: 'الیاف مصنوعی', titleEn: 'Synthetic Fibers', icon: 'Cpu', description: 'الیاف پلی‌استر، ویسکوز، نایلون و اکریلیک', displayOrder: 5 },
      { slug: 'petrochemical-inputs', titleFa: 'مواد پتروشیمی و پلیمری', titleEn: 'Petrochemical Inputs', icon: 'Flame', description: 'چیپس پلی‌استر، گرانول PP و مواد پلیمری نساجی', displayOrder: 6 },
    ],
  },
  {
    slug: 'yarn-fibers',
    titleFa: 'نخ و الیاف',
    titleEn: 'Yarn & Fibers',
    icon: 'Disc',
    description: 'انواع نخ‌های ریسندگی، فیلامنت و صنعتی نساجی',
    displayOrder: 2,
    children: [
      { slug: 'spun-yarn', titleFa: 'نخ ریسیده شده', titleEn: 'Spun Yarn', icon: 'Disc', description: 'نخ رینگ، اپن‌اند و شانه شده در نمرات گوناگون', displayOrder: 1 },
      { slug: 'filament-yarn', titleFa: 'نخ فیلامنت', titleEn: 'Filament Yarn', icon: 'Disc', description: 'نخ‌های فیلامنتی پلی‌استر، DTY، FDY و POY', displayOrder: 2 },
      { slug: 'industrial-yarn', titleFa: 'نخ صنعتی و فنی', titleEn: 'Industrial Yarn', icon: 'Wrench', description: 'نخ‌های با استحکام بالا، نسوز و کاربردهای ویژه', displayOrder: 3 },
    ],
  },
  {
    slug: 'fabrics-textiles',
    titleFa: 'پارچه و منسوجات',
    titleEn: 'Fabrics',
    icon: 'Shirt',
    description: 'انواع پارچه‌های بافته شده، گردباف، تاری پودی و منسوجات فنی',
    displayOrder: 3,
    children: [
      { slug: 'cotton-fabric', titleFa: 'پارچه پنبه‌ای و تریکو', titleEn: 'Cotton Fabric', icon: 'Shirt', description: 'پارچه‌های یکرو، دورس، ملانژ و کتان خالص', displayOrder: 1 },
      { slug: 'denim', titleFa: 'پارچه جین و کتان', titleEn: 'Denim', icon: 'Square', description: 'انواع پارچه جین ضخیم، کشی و پارچه‌های کتان سنگین', displayOrder: 2 },
      { slug: 'knitted-fabric', titleFa: 'پارچه گردباف و کشباف', titleEn: 'Knitted Fabric', icon: 'Waves', description: 'انواع پارچه ریب، ژاکارد، دورس پنبه‌ای و لایکرا', displayOrder: 3 },
      { slug: 'technical-textile', titleFa: 'منسوجات فنی و صنعتی', titleEn: 'Technical Textile', icon: 'ShieldCheck', description: 'پارچه‌های ضدآب، تنفسی، ژئوتکستایل و فیلتراسیون', displayOrder: 4 },
      { slug: 'upholstery-fabric', titleFa: 'پارچه مبلی و دکوراسیون', titleEn: 'Upholstery Fabric', icon: 'Armchair', description: 'پارچه‌های مخمل، پتینه، شنل و رومبلی مقاوم', displayOrder: 5 },
      { slug: 'curtain-fabric', titleFa: 'پارچه پرده‌ای', titleEn: 'Curtain Fabric', icon: 'Grid', description: 'تور، حریر، بلک‌اوت و پارچه‌های پرده‌ای دکوراتیو', displayOrder: 6 },
    ],
  },
  {
    slug: 'accessories-trims',
    titleFa: 'خرج کار و ملزومات',
    titleEn: 'Accessories',
    icon: 'Scissors',
    description: 'انواع ملزومات تولید پوشاک، خرج‌کار و اقلام بسته‌بندی',
    displayOrder: 4,
    children: [
      { slug: 'zipper', titleFa: 'زیپ و ماشین زیپ', titleEn: 'Zipper', icon: 'Minimize2', description: 'زیپ‌های فلزی، استخوانی، نایلونی و سرزیپ‌های صنعتی', displayOrder: 1 },
      { slug: 'button', titleFa: 'دکمه و پرچ', titleEn: 'Button', icon: 'Circle', description: 'دکمه‌های پلی‌استر، چوبی، فلزی، صدفی و پرچ‌های جین', displayOrder: 2 },
      { slug: 'thread', titleFa: 'نخ دوخت و خیاطی', titleEn: 'Thread', icon: 'Crosshair', description: 'انواع نخ قرقره، دوک، نخ روکار و سردوز پلی‌استر', displayOrder: 3 },
      { slug: 'label', titleFa: 'مارک، لیبل و اتیکت', titleEn: 'Label', icon: 'Tag', description: 'اتیکت بافتنی، چاپی، سیلیکونی، چرمی و سایزبندی', displayOrder: 4 },
      { slug: 'packaging', titleFa: 'بسته‌بندی و کاور', titleEn: 'Packaging', icon: 'Package', description: 'سلفون، جعبه لباس، کاور کت‌وشلوار و کارتن صادراتی', displayOrder: 5 },
    ],
  },
  {
    slug: 'machinery-equipment',
    titleFa: 'ماشین‌آلات و تجهیزات',
    titleEn: 'Machinery',
    icon: 'Settings',
    description: 'خطوط تولید، ماشین‌آلات نساجی، دوخت و پرداخت صنعتی',
    displayOrder: 5,
    children: [
      { slug: 'spinning-machinery', titleFa: 'ماشین‌آلات ریسندگی', titleEn: 'Spinning Machinery', icon: 'Cpu', description: 'کاردینگ، شانه، رینگ، اتوکنر و اپن‌اند ریسندگی', displayOrder: 1 },
      { slug: 'weaving-machinery', titleFa: 'ماشین‌آلات بافندگی', titleEn: 'Weaving Machinery', icon: 'Grid', description: 'ماشین‌آلات بافندگی تاری‌پودی سولزر، پیکانول و راپیر', displayOrder: 2 },
      { slug: 'sewing-machinery', titleFa: 'چرخ و ماشین‌آلات دوخت صنعتی', titleEn: 'Sewing Machinery', icon: 'Scissors', description: 'چرخ‌های راسته، سردوز، میان‌دوز و الیک کامپیوتری', displayOrder: 3 },
      { slug: 'cutting-machinery', titleFa: 'میز و دستگاه‌های برش', titleEn: 'Cutting Machinery', icon: 'Sliders', description: 'دستگاه برش اتوماتیک CNC، طاقه‌پهن‌کن و قیچی عمودبر', displayOrder: 4 },
      { slug: 'printing-machinery', titleFa: 'دستگاه‌های چاپ و تکمیل', titleEn: 'Printing Machinery', icon: 'Printer', description: 'کلندر ترانسفر، پرینتر دیجیتال سابلیمیشن و روتاری', displayOrder: 5 },
    ],
  },
  {
    slug: 'services',
    titleFa: 'خدمات نساجی و دوخت',
    titleEn: 'Services',
    icon: 'Sparkles',
    description: 'خدمات کارمزدی برش، دوخت، تکمیل، طراحی و مشاوره تخصصی',
    displayOrder: 6,
    children: [
      { slug: 'cmt-subcontracting', titleFa: 'خدمات دوخت و کارمزدی', titleEn: 'Sewing', icon: 'CheckSquare', description: 'پذیرش سفارشات دوخت صنعتی و زنجیره‌ای انواع پوشاک', displayOrder: 1 },
      { slug: 'cutting-services', titleFa: 'خدمات برش صنعتی', titleEn: 'Cutting', icon: 'Scissors', description: 'خدمات طاقه‌پهن‌کنی و برش با دستگاه‌های دقیق CNC', displayOrder: 2 },
      { slug: 'pattern-making', titleFa: 'طراحی الگو و گرادینگ', titleEn: 'Pattern Making', icon: 'PenTool', description: 'طراحی الگو با نرم‌افزارهای جمینی، گربر و مارکر', displayOrder: 3 },
      { slug: 'embroidery', titleFa: 'گلدوزی و چاپ صنعتی', titleEn: 'Embroidery', icon: 'Palette', description: 'خدمات گلدوزی کامپیوتری چندکله، چاپ سیلک و DTF', displayOrder: 4 },
      { slug: 'textile-consulting', titleFa: 'مشاوره فنی و آزمایشگاهی نساجی', titleEn: 'Textile Consulting', icon: 'BookOpen', description: 'آزمایشگاه کنترل کیفیت، تست استحکام و استاندارد پارچه', displayOrder: 5 },
      { slug: 'repair-services', titleFa: 'تعمیر و نگهداری ماشین‌آلات', titleEn: 'Repair Services', icon: 'Tool', description: 'تعمیرات تخصصی برد، مکانیک و تنظیم دوره‌ای چرخ و دستگاه', displayOrder: 6 },
    ],
  },
];
