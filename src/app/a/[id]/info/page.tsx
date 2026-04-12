'use client';

import AvatarInfo from '../AvatarInfo';
import AvatarTags from '../AvatarTags';
import { useAvatar } from '../AvatarContext';

export default function AvatarInfoPage() {
    const { avatar } = useAvatar();
    return (
        <div className="space-y-6">
            <AvatarInfo avatar={avatar} />
            <AvatarTags avatar={avatar} />
        </div>
    );
}
