'use client';

import AvatarDescription from './Description';
import { useAvatar } from './AvatarContext';

export default function AvatarPage() {
    const { avatar } = useAvatar();
    return <AvatarDescription avatar={avatar} />;
}
