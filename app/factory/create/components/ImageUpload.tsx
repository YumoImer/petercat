import React from 'react';
import { Image } from '@nextui-org/react';
import { toast } from 'react-toastify';
import { BotProfile } from '../interface';
import { useImmer } from 'use-immer';
import type { Updater } from 'use-immer';

interface ImageUploadProps {
  botProfile?: BotProfile;
  setBotProfile?: Updater<BotProfile>;
}

const ImageUploadComponent = (props: ImageUploadProps) => {
  const { botProfile, setBotProfile } = props;
  const [imageSrc, setImageSrc] = useImmer(botProfile?.avatar);

  const handleImageChange = async (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageSrc(reader?.result as string);
      setBotProfile?.((draft) => {
        draft.avatar = reader?.result as string;
      });
    };

    if (file) {
      reader.readAsDataURL(file);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setBotProfile?.((draft) => {
            draft.avatar = data.realPath;
          });
        } else {
          console.error('upload error');
          toast.error('upload error');
        }
      } catch (error) {
        console.error('upload error:', error);
        toast.error('upload error');
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      {imageSrc ? (
        <label className="w-20 h-20 flex items-center justify-center">
          <Image
            src={imageSrc}
            className=" w-20 h-20 cursor-pointer rounded-full  cursor-pointer rounded-full border-2 border-token-border-medium"
            alt="Preview"
          />
          <input
            name="avatar"
            accept="image/*"
            type="file"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      ) : (
        <label className="w-16 h-16 flex items-center justify-center cursor-pointer rounded-full border-2 border-dashed border-token-border-medium">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-3xl"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <input
            accept="image/*"
            type="file"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUploadComponent;