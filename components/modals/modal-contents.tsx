"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { ModalContentProps } from './types';
import { PlatformDescriptions } from "@/types/business";
import { ModalRegistry } from './modal-types';
import UpdateDescriptionModal from './update-description-modal';

const UpdateDescriptionModal = ({ onClose }: ModalContentProps) => {
        const [descriptions, setDescriptions] = useState<PlatformDescriptions>({
                google: '',
                facebook: '',
                firmy: '',
                instagram: ''
        });
        const [isSaving, setIsSaving] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [improvingPlatform, setImprovingPlatform] = useState<string | null>(null);

        const MAX_CHARS = {
                google: 750,
                facebook: 1000,
                firmy: 500,
                instagram: 2200
        };

        useEffect(() => {
                const loadDescriptions = async () => {
                        try {
                                setIsLoading(true);
                                const response = await fetch('/api/descriptions');
                                const data = await response.json();

                                if (data.success) {
                                        setDescriptions(data.data);
                                } else {
                                        throw new Error('Failed to load descriptions');
                                }
                        } catch (error) {
                                console.error('Load error:', error);
                                toast.error('Failed to load descriptions');
                        } finally {
                                setIsLoading(false);
                        }
                };

                loadDescriptions();
        }, []);

        const handleImprove = async (platform: keyof PlatformDescriptions) => {
                try {
                        setImprovingPlatform(platform);
                        const response = await fetch('/api/improve', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                        platform,
                                        text: descriptions[platform]
                                }),
                        });

                        if (!response.ok) throw new Error('Failed to improve text');

                        const data = await response.json();
                        setDescriptions(prev => ({
                                ...prev,
                                [platform]: data.improvedText
                        }));
                        toast.success(`${platform} description improved`);
                } catch (error) {
                        toast.error(`Failed to improve ${platform} description`);
                } finally {
                        setImprovingPlatform(null);
                }
        };

        const handleSave = async () => {
                try {
                        setIsSaving(true);
                        const response = await fetch('/api/descriptions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ descriptions }),
                        });

                        if (!response.ok) throw new Error('Failed to save descriptions');

                        toast.success('All descriptions saved successfully');
                        onClose();
                } catch (error) {
                        console.error('Save error:', error);
                        toast.error('Failed to save descriptions');
                } finally {
                        setIsSaving(false);
                }
        };

        return (
                <div className="grid gap-6">
                        {Object.entries(descriptions).map(([platform, text]) => (
                                <div key={platform} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-semibold capitalize">{platform}</h3>
                                                <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleImprove(platform as keyof PlatformDescriptions)}
                                                        disabled={isLoading || improvingPlatform === platform || !text}
                                                >
                                                        {improvingPlatform === platform ? "Improving..." : "Improve"}
                                                </Button>
                                        </div>
                                        <div className="space-y-1">
                                                <Textarea
                                                        value={text}
                                                        onChange={(e) => setDescriptions(prev => ({
                                                                ...prev,
                                                                [platform]: e.target.value
                                                        }))}
                                                        placeholder={`Enter ${platform} description...`}
                                                        disabled={isLoading || improvingPlatform === platform}
                                                        className={text.length > MAX_CHARS[platform as keyof typeof MAX_CHARS] ? 'border-red-500' : ''}
                                                        rows={4}
                                                />
                                                <div className={`text-sm text-right ${text.length > MAX_CHARS[platform as keyof typeof MAX_CHARS]
                                                        ? 'text-red-500'
                                                        : 'text-gray-500'
                                                        }`}>
                                                        {text.length}/{MAX_CHARS[platform as keyof typeof MAX_CHARS]}
                                                </div>
                                        </div>
                                </div>
                        ))}
                        <div className="flex justify-end">
                                <Button
                                        onClick={handleSave}
                                        disabled={isSaving || isLoading}
                                >
                                        {isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save All'}
                                </Button>
                        </div>
                </div>
        );
};

export default UpdateDescriptionModal;