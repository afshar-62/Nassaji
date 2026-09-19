import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ShieldCheck,
  MapPin,
  FileCheck,
  Plus,
  Trash2,
  Save,
  Clock,
  Truck,
  Phone,
  Globe,
  Tag,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import {
  profilesService,
  OwnerProfile,
  ProfileType,
  ProfileCredential,
  ProfileLocation,
  UnitType,
} from '../core/api/profiles.service.ts';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: OwnerProfile) => void;
}

const WORK_GROUPS = [
  'تولید پوشاک',
  'ریسندگی و تولید نخ',
  'بافندگی (تخت و گرد)',
  'رنگرزی، چاپ و تکمیل',
  'طراحی، الگوسازی و نمونه‌دوزی',
  'تأمین الیاف و مواد اولیه',
  'ماشین‌آلات و تجهیزات نساجی',
  'بسته‌بندی و ملزومات دوخت',
];

const COLLABORATION_OPTIONS = [
  'کارمزدی (اجرتی)',
  'تولید سفارشی (OEM)',
  'پیمانکاری خطوط تولید',
  'فروش عمده نقدی',
  'تأمین مستمر سالانه',
  'مشاوره و طراحی صنعتی',
];

const DAYS_OF_WEEK = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'capacity' | 'locations' | 'credentials' | 'contacts'>('identity');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [profileType, setProfileType] = useState<ProfileType>('PERSON');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [workGroup, setWorkGroup] = useState('');
  const [activityDomain, setActivityDomain] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [yearsActive, setYearsActive] = useState<number | ''>('');
  const [primaryProducts, setPrimaryProducts] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [capacitySummary, setCapacitySummary] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [shippingCapability, setShippingCapability] = useState(true);
  const [onsiteServiceCapability, setOnsiteServiceCapability] = useState(false);
  const [collaborationModes, setCollaborationModes] = useState<string[]>([]);

  // Contacts
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // New location modal state
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitType, setNewUnitType] = useState<UnitType>('workshop');
  const [newProvince, setNewProvince] = useState('تهران');
  const [newCity, setNewCity] = useState('تهران');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // New credential modal state
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [newCredTitle, setNewCredTitle] = useState('');
  const [newCredFileUrl, setNewCredFileUrl] = useState('');
  const [newCredDesc, setNewCredDesc] = useState('');

  const loadOwnerProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profilesService.fetchOwnerProfile();
      if (data) {
        setProfile(data);
        setProfileType(data.profileType);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setBusinessName(data.businessName || '');
        setWorkGroup(data.workGroup || '');
        setActivityDomain(data.activityDomain || '');
        setSpecialties(data.specialties || []);
        setBio(data.bio || '');
        setYearsActive(data.yearsActive || '');
        setPrimaryProducts(data.primaryProducts || []);
        setServices(data.services || []);
        setCapacitySummary(data.capacitySummary || '');
        setWorkingHours(data.workingHours || '');
        setWorkingDays(data.workingDays || []);
        setShippingCapability(data.shippingCapability ?? true);
        setOnsiteServiceCapability(data.onsiteServiceCapability ?? false);
        setCollaborationModes(data.collaborationModes || []);
        setPhone(data.contacts?.phone || '');
        setMobile(data.contacts?.mobile || '');
        setWhatsapp(data.contacts?.whatsapp || '');
        setTelegram(data.contacts?.telegram || '');
        setEmail(data.contacts?.email || '');
        setWebsiteUrl(data.website?.url || '');
      }
    } catch (err: any) {
      console.error('Error loading owner profile:', err);
      setError(err?.message || 'خطا در بارگذاری اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOwnerProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (item: string) => {
    setSpecialties(specialties.filter((s) => s !== item));
  };

  const handleAddProduct = () => {
    if (newProduct.trim() && !primaryProducts.includes(newProduct.trim())) {
      setPrimaryProducts([...primaryProducts, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const toggleCollaboration = (mode: string) => {
    if (collaborationModes.includes(mode)) {
      setCollaborationModes(collaborationModes.filter((m) => m !== mode));
    } else {
      setCollaborationModes([...collaborationModes, mode]);
    }
  };

  const handleSave = async (targetStatus?: 'ACTIVE' | 'INCOMPLETE') => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload: any = {
      profileType,
      firstName,
      lastName,
      businessName,
      workGroup,
      activityDomain,
      specialties,
      bio,
      yearsActive: yearsActive ? Number(yearsActive) : null,
      primaryProducts,
      services,
      capacitySummary,
      workingHours,
      workingDays,
      shippingCapability,
      onsiteServiceCapability,
      collaborationModes,
      phone,
      mobile,
      whatsapp,
      telegram,
      email,
      websiteUrl,
    };

    if (targetStatus) {
      payload.status = targetStatus;
    }

    try {
      let updated: OwnerProfile;
      if (profile) {
        updated = await profilesService.updateOwnerProfile(payload);
      } else {
        updated = await profilesService.createProfile(payload);
      }
      setProfile(updated);
      setSuccessMessage(
        targetStatus === 'ACTIVE'
          ? 'پروفایل حرفه‌ای با موفقیت فعال و ذخیره شد.'
          : 'اطلاعات پیش‌نویس با موفقیت ذخیره شد.'
      );
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (err: any) {
      setError(err?.message || 'خطا در ذخیره‌سازی اطلاعات پروفایل.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!newUnitTitle || !newAddress) {
      alert('عنوان واحد و نشانی الزامی است.');
      return;
    }

    try {
      await profilesService.addLocation({
        unitTitle: newUnitTitle,
        unitType: newUnitType,
        country: 'ایران',
        province: newProvince,
        city: newCity,
        area: newArea,
        address: newAddress,
        latitude: null, // Explicitly no fake coordinates
        longitude: null,
        isApproximate: true,
        isPrimary: (profile?.locations || []).length === 0,
      });
      setShowAddLocation(false);
      setNewUnitTitle('');
      setNewAddress('');
      setNewArea('');
      await loadOwnerProfile();
    } catch (err: any) {
      alert(err?.message || 'خطا در ثبت واحد کاری');
    }
  };

  const handleRemoveLocation = async (id: string) => {
    if (!confirm('آیا از حذف این موقعیت اطمینان دارید؟')) return;
    try {
      await profilesService.removeLocation(id);
      await loadOwnerProfile();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف واحد کاری');
    }
  };

  const handleCreateCredential = async () => {
    if (!newCredTitle || !newCredFileUrl) {
      alert('عنوان مدرک و فایل الزامی است.');
      return;
    }

    try {
      await profilesService.addCredential({
        title: newCredTitle,
        fileUrl: newCredFileUrl,
        description: newCredDesc,
        isOfficiallyVerified: false, // Strictly unverified self-assertion
      });
      setShowAddCredential(false);
      setNewCredTitle('');
      setNewCredFileUrl('');
      setNewCredDesc('');
      await loadOwnerProfile();
    } catch (err: any) {
      alert(err?.message || 'خطا در ثبت مدرک');
    }
  };

  const handleRemoveCredential = async (id: string) => {
    if (!confirm('آیا از حذف این مدرک اطمینان دارید؟')) return;
    try {
      await profilesService.removeCredential(id);
      await loadOwnerProfile();
    } catch (err: any) {
      alert(err?.message || 'خطا در حذف مدرک');
    }
  };

  const baseline = profile?.baseline;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              {profileType === 'PERSON' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-zinc-900">
                  {profile ? 'مدیریت هویت و حضور حرفه‌ای' : 'ایجاد هویت حرفه‌ای جدید'}
                </h2>
                {profile && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      profile.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {profile.status === 'ACTIVE' ? 'فعال' : 'پیش‌نویس / ناقص'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                تاروپود B2B • اطلاعات پایدار هویتی مجزا از آگهی‌های معاملاتی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-200/60 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Baseline Validation Banner (if exists and incomplete) */}
        {baseline && !baseline.isComplete && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">نواقص هویت حرفه‌ای برای فعال‌سازی عمومی: </span>
              <span>{baseline.missingFields.join('، ')}</span>
            </div>
          </div>
        )}

        {/* Success/Error Notices */}
        {error && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-white px-5 gap-4 overflow-x-auto text-xs font-bold text-zinc-600">
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'identity'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent hover:text-zinc-900'
            }`}
          >
            ۱. هویت و دسته‌بندی
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'capacity'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent hover:text-zinc-900'
            }`}
          >
            ۲. توان و شرایط کاری
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'locations'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent hover:text-zinc-900'
            }`}
          >
            <span>۳. واحدها و موقعیت</span>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {profile?.locations?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent hover:text-zinc-900'
            }`}
          >
            <span>۴. مدارک و مجوزها</span>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {profile?.credentials?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent hover:text-zinc-900'
            }`}
          >
            ۵. راه‌های ارتباطی
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm">در حال بارگذاری اطلاعات پروفایل...</div>
          ) : (
            <>
              {/* TAB 1: IDENTITY */}
              {activeTab === 'identity' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">نوع هویت حرفه‌ای</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setProfileType('PERSON')}
                        className={`p-3 rounded-2xl border text-right flex items-center gap-2.5 transition-all ${
                          profileType === 'PERSON'
                            ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <User className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="text-xs font-bold">شخص حقیقی / متخصص</div>
                          <div className="text-[11px] text-zinc-500">طراح، خیاط، تکنسین، استادکار</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileType('ORGANIZATION')}
                        className={`p-3 rounded-2xl border text-right flex items-center gap-2.5 transition-all ${
                          profileType === 'ORGANIZATION'
                            ? 'border-amber-600 bg-amber-50/70 text-amber-900 font-bold'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <Building2 className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="text-xs font-bold">سازمان / کارخانه / کارگاه</div>
                          <div className="text-[11px] text-zinc-500">شرکت حقوقی، تولیدی، مجتمع صنعتی</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {profileType === 'PERSON' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">نام</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="مثال: احمد"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">نام خانوادگی</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="مثال: احمدی"
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      {profileType === 'ORGANIZATION'
                        ? 'نام مجموعه / شرکت / برند رسمی *'
                        : 'نام کارگاه / فروشگاه / عنوان تجاری (اختیاری)'}
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="مثال: کارگاه تخصصی برش و دوخت پارس"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">گروه کاری اصلی *</label>
                      <select
                        value={workGroup}
                        onChange={(e) => setWorkGroup(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none bg-white"
                      >
                        <option value="">انتخاب گروه کاری</option>
                        {WORK_GROUPS.map((wg) => (
                          <option key={wg} value={wg}>
                            {wg}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">شاخه / حوزه فعالیت *</label>
                      <input
                        type="text"
                        value={activityDomain}
                        onChange={(e) => setActivityDomain(e.target.value)}
                        placeholder="مثال: دوخت تریکو و اسلش"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      تخصص‌ها و قابلیت‌های فنی (حداقل یک مورد الزامی است) *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                        placeholder="مثال: الگوسازی صنعتی، برش CNC، دوخت تریکو"
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecialty}
                        className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>افزودن</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {specialties.map((s) => (
                        <span
                          key={s}
                          className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(s)}
                            className="hover:text-rose-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                      {specialties.length === 0 && (
                        <span className="text-[11px] text-zinc-400">هیچ تخصصی ثبت نشده است.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">معرفی و رزومه حرفه‌ای</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="سابقه کاری، زمینه تخصصی و ظرفیت‌های همکاری خود را بنویسید..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CAPACITY & COLLABORATION */}
              {activeTab === 'capacity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">سابقه فعالیت (سال)</label>
                      <input
                        type="number"
                        value={yearsActive}
                        onChange={(e) => setYearsActive(e.target.value ? Number(e.target.value) : '')}
                        placeholder="مثال: ۱۵"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">ساعات کاری</label>
                      <input
                        type="text"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        placeholder="مثال: ۰۸:۰۰ الی ۱۸:۰۰"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">خلاصه ظرفیت تولیدی / خدماتی</label>
                    <input
                      type="text"
                      value={capacitySummary}
                      onChange={(e) => setCapacitySummary(e.target.value)}
                      placeholder="مثال: ظرفیت دوخت ماهانه ۱۵,۰۰۰ قطعه با ۲۰ چرخ تخصصی"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">روزهای فعال</label>
                    <div className="flex flex-wrap gap-1.5">
                      {DAYS_OF_WEEK.map((day) => {
                        const active = workingDays.includes(day);
                        return (
                          <button
                            type="button"
                            key={day}
                            onClick={() => toggleWorkingDay(day)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              active
                                ? 'bg-amber-600 text-white border-amber-600 font-bold'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">مدل‌های همکاری پذیرفته‌شده</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COLLABORATION_OPTIONS.map((mode) => {
                        const active = collaborationModes.includes(mode);
                        return (
                          <button
                            type="button"
                            key={mode}
                            onClick={() => toggleCollaboration(mode)}
                            className={`p-2 rounded-xl text-xs text-right border transition-all flex items-center justify-between ${
                              active
                                ? 'bg-amber-50 text-amber-900 border-amber-600 font-bold'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            <span>{mode}</span>
                            {active && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingCapability}
                        onChange={(e) => setShippingCapability(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-800">امکان ارسال بار به سراسر کشور</div>
                        <div className="text-[10px] text-zinc-500">باربری، تیپاکس، پست</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onsiteServiceCapability}
                        onChange={(e) => setOnsiteServiceCapability(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-800">امکان اعزام و ارائه خدمات در محل</div>
                        <div className="text-[10px] text-zinc-500">تعمیرات، نصب ماشین‌آلات، مشاوره</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: LOCATIONS */}
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">واحدهای کاری و موقعیت‌ها</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        کارگاه‌ها، انبارها، دفاتر مرکزی و شوروم‌ها
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddLocation(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن واحد</span>
                    </button>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">حفاظت از دقت مکانی: </span>
                      تاروپود هرگز موقعیت مرکز شهر را به عنوان مکان کارگاه شما نمایش نمی‌دهد. موقعیت‌ها بر اساس نشانی رسمی و واحد کاری مشخص می‌شوند.
                    </div>
                  </div>

                  {showAddLocation && (
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                      <div className="text-xs font-bold text-zinc-900">مشخصات واحد کاری جدید</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">عنوان واحد *</label>
                          <input
                            type="text"
                            value={newUnitTitle}
                            onChange={(e) => setNewUnitTitle(e.target.value)}
                            placeholder="مثال: کارگاه مرکزی دوخت"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">نوع واحد</label>
                          <select
                            value={newUnitType}
                            onChange={(e) => setNewUnitType(e.target.value as UnitType)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                          >
                            <option value="workshop">کارگاه / خط تولید</option>
                            <option value="warehouse">انبار</option>
                            <option value="office">دفتر مرکزی</option>
                            <option value="showroom">شوروم و نمایشگاه</option>
                            <option value="service_center">مرکز خدمات</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">استان</label>
                          <input
                            type="text"
                            value={newProvince}
                            onChange={(e) => setNewProvince(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">شهر</label>
                          <input
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-700 mb-1">منطقه / محله</label>
                          <input
                            type="text"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            placeholder="مثال: جمهوری"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">نشانی دقیق *</label>
                        <input
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="خیابان، کوچه، پلاک، واحد"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddLocation(false)}
                          className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 rounded-xl"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateLocation}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
                        >
                          ثبت واحد
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(profile?.locations || []).map((loc) => (
                      <div
                        key={loc.id}
                        className="p-3.5 rounded-2xl border border-zinc-200 bg-white flex items-start justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{loc.unitTitle}</span>
                              {loc.isPrimary && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  واحد اصلی
                                </span>
                              )}
                              {loc.isApproximate && (
                                <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.2 rounded-full">
                                  محدوده تقریبی
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-600 mt-1">
                              {loc.province}، {loc.city} {loc.area ? `(${loc.area})` : ''} - {loc.address}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => loc.id && handleRemoveLocation(loc.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(profile?.locations || []).length === 0 && !showAddLocation && (
                      <div className="py-6 text-center text-xs text-zinc-400">
                        هنوز هیچ واحد کاری ثبت نشده است.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CREDENTIALS */}
              {activeTab === 'credentials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">مدارک، پروانه‌ها و گواهینامه‌ها</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        پروانه کسب، گواهینامه‌های استاندارد، مجوز اتحادیه
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddCredential(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن مدرک</span>
                    </button>
                  </div>

                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3 text-[11px] text-blue-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">شفافیت اعتبارسنجی: </span>
                      مدارک بارگذاری شده بدون بررسی و تأیید مراجع رسمی به عنوان «تأیید رسمی» علامت‌گذاری نمی‌شوند.
                    </div>
                  </div>

                  {showAddCredential && (
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-3">
                      <div className="text-xs font-bold text-zinc-900">مشخصات مدرک جدید</div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">عنوان مدرک / پروانه *</label>
                        <input
                          type="text"
                          value={newCredTitle}
                          onChange={(e) => setNewCredTitle(e.target.value)}
                          placeholder="مثال: پروانه کسب معتبر از اتحادیه پوشاک"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">لینک یا آدرس فایل تصویر مدرک *</label>
                        <input
                          type="text"
                          value={newCredFileUrl}
                          onChange={(e) => setNewCredFileUrl(e.target.value)}
                          placeholder="https://example.com/certificate.jpg"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 mb-1">توضیحات تکمیلی (اختیاری)</label>
                        <input
                          type="text"
                          value={newCredDesc}
                          onChange={(e) => setNewCredDesc(e.target.value)}
                          placeholder="مثال: شماره ثبت، مرجع صادرکننده"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddCredential(false)}
                          className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200 rounded-xl"
                        >
                          انصراف
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateCredential}
                          className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700"
                        >
                          ثبت مدرک
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {(profile?.credentials || []).map((cred) => (
                      <div
                        key={cred.id}
                        className="p-3.5 rounded-2xl border border-zinc-200 bg-white flex items-start justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <FileCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-900">{cred.title}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  cred.isOfficiallyVerified
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-zinc-100 text-zinc-600'
                                }`}
                              >
                                {cred.isOfficiallyVerified ? 'تأیید رسمی اتحادیه' : 'خوداظهاری کاربر'}
                              </span>
                            </div>
                            {cred.description && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">{cred.description}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => cred.id && handleRemoveCredential(cred.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(profile?.credentials || []).length === 0 && !showAddCredential && (
                      <div className="py-6 text-center text-xs text-zinc-400">
                        هنوز هیچ مدرکی بارگذاری نشده است.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">شماره تلفن همراه</label>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="0912..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">تلفن ثابت کارگاه / شرکت</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="021..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">واتس‌اپ</label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="0912..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">شناسه تلگرام</label>
                      <input
                        type="text"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="@username"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">آدرس ایمیل</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">آدرس وب‌سایت</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 focus:border-amber-600 outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-500">
            {profile?.slug && (
              <span>
                شناسه یکتا:{' '}
                <span className="font-mono text-zinc-700 select-all">{profile.slug}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('INCOMPLETE')}
              className="px-4 py-2 rounded-xl border border-zinc-300 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-zinc-500" />
              <span>ذخیره پیش‌نویس</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('ACTIVE')}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'در حال ثبت...' : 'انتشار و فعال‌سازی هویت'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
