import ImageUploader from '@/components/ui/image-uploader';
import { CurrentUser } from '@/lib/api/types';

interface ProfileImagesSectionProps {
  thumbnail: string | null | undefined;
  banner: string | null | undefined;
  currentUser: CurrentUser | null;
  thumbnailFlag: number;
  bannerFlag: number;
  canSaveFlag: number;
  onThumbnailChange: (val: string | null) => void;
  onBannerChange: (val: string | null) => void;
  onFlagChange: (flag: number) => void;
}

export default function ProfileImagesSection({
  thumbnail,
  banner,
  currentUser,
  thumbnailFlag,
  bannerFlag,
  canSaveFlag,
  onThumbnailChange,
  onBannerChange,
  onFlagChange,
}: ProfileImagesSectionProps) {
  return (
    <div className="space-y-6" id="profile-images">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Profile picture</h2>
        <ImageUploader
          value={thumbnail}
          onChange={(val) => {
            onThumbnailChange(val);
            onFlagChange(thumbnailFlag | canSaveFlag);
          }}
          onFlagChange={onFlagChange}
          currentFlag={canSaveFlag}
          flag={thumbnailFlag}
          id="thumbnail-file"
          src={currentUser?.thumbnail || ''}
          alt={currentUser?.display || 'Thumbnail'}
          className="w-48 h-48"
          width={256}
          height={256}
        />
        <span className="text-sm text-fd-muted-foreground">512×512px — 1:1</span>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Banner picture</h2>
        <ImageUploader
          value={banner}
          onChange={(val) => {
            onBannerChange(val);
            onFlagChange(bannerFlag | canSaveFlag);
          }}
          onFlagChange={onFlagChange}
          currentFlag={canSaveFlag}
          flag={bannerFlag}
          id="banner-file"
          src={currentUser?.banner || ''}
          alt={currentUser?.display || 'Banner'}
          className="w-48 h-36"
          width={256}
          height={192}
        />
        <span className="text-sm text-fd-muted-foreground">1024×768px — 4:3</span>
      </div>
    </div>
  );
}
