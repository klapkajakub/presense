"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { ModalContentProps } from './types';
import { PlatformDescriptions } from "@/types/business";
import { PLATFORM_CONFIGS } from '@/types/business';

export function UpdateDescriptionModal({ onClose }: ModalContentProps) {
    const [descriptions, setDescriptions] = useState<PlatformDescriptions>({
        google: '',
        facebook: '',
        firmy: '',
        instagram: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [improvingPlatform, setImprovingPlatform] = useState<string | null>(null);

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
            const config = PLATFORM_CONFIGS[platform];

            const response = await fetch('/api/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform,
                    text: descriptions[platform],
                    maxLength: config.maxLength,
                    context: config.description
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to improve text');
            }

            // Validate improved text length
            if (data.improvedText.length > config.maxLength) {
                throw new Error(`Improved text exceeds ${config.maxLength} characters`);
            }

            setDescriptions(prev => ({
                ...prev,
                [platform]: data.improvedText
            }));

            toast.success(`${config.name} description improved`);
        } catch (error) {
            console.error('Improve error:', error);
            toast.error(`Failed to improve ${PLATFORM_CONFIGS[platform].name} description`);
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
            {Object.entries(descriptions).map(([platform, text]) => {
                const config = PLATFORM_CONFIGS[platform];
                return (
                    <div key={platform} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{config.name}</h3>
                                <p className="text-sm text-muted-foreground">{config.description}</p>
                            </div>
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
                                placeholder={`Enter ${config.name} description...`}
                                disabled={isLoading || improvingPlatform === platform}
                                className={text.length > config.maxLength ? 'border-red-500' : ''}
                                rows={4}
                            />
                            <div className={`text-sm text-right ${text.length > config.maxLength
                                ? 'text-red-500'
                                : 'text-gray-500'
                                }`}>
                                {text.length}/{config.maxLength} characters
                            </div>
                        </div>
                    </div>
                );
            })}
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