'use client';
import React, { useState } from 'react'
import SettingsHeaderInfo from './SettingsHeaderInfo'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { changePassword } from '@/actions/actions';
import { getErrorMessage, isZodError, userUpdatePasswordSchema, UserUpdatePasswordType } from 'tweetly-shared';
import { z } from 'zod';

export default function ChangePassword() {
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);
    const [currentPasswordType, setCurrentPasswordType] = useState<'password' | 'text'>('password');
    const [newPasswordType, setNewPasswordType] = useState<'password' | 'text'>('password');
    const [confirmNewPasswordType, setConfirmNewPasswordType] = useState<'password' | 'text'>('password');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        reset,
        resetField,
    } = useForm<UserUpdatePasswordType>({ resolver: zodResolver(userUpdatePasswordSchema) });

    const onSubmit = async (formData: UserUpdatePasswordType) => {
        if (isSubmitting) return;

        try {
            const response = await changePassword(formData);

            if (!response.success) {
                if (response.error.details) throw new z.ZodError(response.error.details);
                else if (response.error.code === 'INCORRECT_CURRENT_PASSWORD') {
                    setError("currentPassword", { type: "manual", message: response.error.message });
                    resetField("currentPassword", { keepError: true });
                    return;
                }
                else throw new Error(response.error.message);
            }

            setCustomError(null);
            setPasswordChanged(true);
            reset();
        } catch (error: unknown) {
            if (isZodError(error)) {
                error.issues.forEach((detail) => {
                    if (detail.path && detail.message) {
                        setError(detail.path[0] as keyof UserUpdatePasswordType, {
                            type: 'manual',
                            message: detail.message
                        });
                    }
                });
            } else {
                const errorMessage = getErrorMessage(error);
                setCustomError(`${errorMessage ?? 'Something went wrong'}, refresh the page or remove cookies. If problem persists, contact the support`);
            }
        }
    }

    return (
        <div className='flex flex-col'>
            <SettingsHeaderInfo header='Change your password' />
            <div className='feed-hr-line'></div>

            <div className='px-4 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                    {/* Current Password */}
                    <div className="relative h-10 w-full">
                        <Input
                            {...register("currentPassword")}
                            type={currentPasswordType}
                            placeholder="Current password"
                            autoFocus={true}
                            tabIndex={1}
                        />
                        <button
                            title={currentPasswordType === 'password' ? 'Show password' : 'Hide password'}
                            type='button'
                            onClick={() => setCurrentPasswordType(currentPasswordType === 'password' ? 'text' : 'password')}
                            className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-secondary-text z-10"
                            tabIndex={4}
                        >
                            {currentPasswordType === 'password' ? <EyeOff size={18} /> : <Eye size={18} className='text-primary'/>}
                        </button>
                    </div>
                    {errors.currentPassword && <p className="error-msg">{errors.currentPassword.message}</p>}

                    <div className='feed-hr-line'></div>

                    {/* New Password */}
                    <div className="relative h-10 w-full">
                        <Input
                            {...register("newPassword")}
                            type={newPasswordType}
                            placeholder="New password"
                            tabIndex={2}
                        />
                        <button
                            title={newPasswordType === 'password' ? 'Show password' : 'Hide password'}
                            type='button'
                            onClick={() => setNewPasswordType(newPasswordType === 'password' ? 'text' : 'password')}
                            className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-secondary-text z-10"
                            tabIndex={5}
                        >
                            {newPasswordType === 'password' ? <EyeOff size={18} /> : <Eye size={18} className='text-primary'/>}
                        </button>
                    </div>
                    {errors.newPassword && <p className="error-msg">{errors.newPassword.message}</p>}

                    {/* Confirm New Password */}
                    <div className="relative h-10 w-full">
                        <Input
                            {...register("confirmNewPassword")}
                            type={confirmNewPasswordType}
                            placeholder="Confirm new password"
                            tabIndex={3}
                        />
                        <button
                            title={confirmNewPasswordType === 'password' ? 'Show password' : 'Hide password'}
                            type='button'
                            onClick={() => setConfirmNewPasswordType(confirmNewPasswordType === 'password' ? 'text' : 'password')}
                            className="absolute right-0 mr-3 top-1/2 transform -translate-y-1/2 text-secondary-text z-10"
                            tabIndex={6}
                        >
                            {confirmNewPasswordType === 'password' ? <EyeOff size={18} /> : <Eye size={18} className='text-primary'/>}
                        </button>
                    </div>
                    {errors.confirmNewPassword && <p className="error-msg">{errors.confirmNewPassword.message}</p>}

                    {customError !== null && <div className='error-msg'>{customError}</div>}

                    {customError === null && passwordChanged && (
                        <div className='text-green-400 text-14'>Password successfully changed</div>
                    )}

                    {/* Submit Button */}
                    {isSubmitting
                        ? <Button className='bg-primary text-white-1 font-bold' disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                        </Button>
                        : <Button className='bg-primary text-white-1 font-bold' tabIndex={7}>Save</Button>
                    }
                </form>
            </div>
        </div>
    )
}
