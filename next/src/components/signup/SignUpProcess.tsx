'use client';
import { Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from 'react';
import SignUpStepZero from './steps/SignUpStepZero';
import SignUpStepOne from './steps/SignUpStepOne';
import { LoggedInTemporaryUserDataType } from 'tweetly-shared';
import SignUpStepThree from './steps/SignUpStepThree';
import SignUpStepFour from './steps/SignUpStepFour';

export type SignUpStepType = {
    dialogOpen: boolean,
    setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setRegistrationStep: React.Dispatch<React.SetStateAction<number | undefined>>,
    customError: string | null,
    setCustomError: React.Dispatch<React.SetStateAction<string | null>>,
};

// Registration process
// Step 0
//      - profile name, email, date of birth
// Step 1
//      - password
// -------- step 0 and 1 data is combined and sent to DB to create temporary user --------

// Step 2
//      - email verification
// -------- update temp. user emailVerified field --------

// Step 3
//      - unique username
// -------- update temp. user username field --------

// Step 4
//      - profile picture
// -------- take temp. user saved data, create a new user with that data and profile picture --------
// -------- remove temp. user, create user session JWT, send to frontend, remove temp. JWT and save new session JWT --------

// Registration process completed

export default function SignUpProcess({ user }: { user: LoggedInTemporaryUserDataType | null }) {
    const [registrationStep, setRegistrationStep] = useState<number | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [customError, setCustomError] = useState<string | null>(null);

    useEffect(() => {
        console.log('test')
        if (user) {
            if (!user.profileName || !user.email || !user.dateOfBirth) {
                setRegistrationStep(0);
            } else if (user.password === false) {
                setRegistrationStep(1);
                setIsDialogOpen(true);
            // } else if (user.emailVerified === false) {
            //     setHasCameBack(true);
            //     setRegistrationStep(2);
            //     setIsDialogOpen(true);
            } else if (!user.username) {
                setRegistrationStep(3);
                setIsDialogOpen(true);
            } else if (!user.profilePicture) {
                setRegistrationStep(4);
                setIsDialogOpen(true);
            }
        } else {
            setRegistrationStep(0);
        }
    }, [user]);

    return (
        <>
            <div className='flex flex-col justify-between gap-8 w-3/4 min-w-[300px] md:w-1/2'>
                <h1 className='text-30 font-bold text-center'>
                    Create your account
                </h1>
                <div className='flex flex-col justify-between items-center gap-8'>
                    <div className='flex flex-col gap-4 w-3/5'>
                        <Button className='rounded-2xl border border-gray-200 bg-transparent focus-visible:bg-none hover:text-white-1'>
                            <Apple className="mr-2 h-4 w-4" /> Sign up with Apple
                        </Button>
                    </div>
                    <p>Or</p>
                    <Button
                        className='bg-primary text-white-1 rounded-2xl border border-gray-200 focus-visible:bg-none'
                        onClick={() => {
                            setIsDialogOpen(true);
                        }}
                    >
                        Sign up with email
                    </Button>
                    <p>Already have an account? <Link href='/login' className='font-bold hover:text-primary'>Log in</Link></p>
                </div>
            </div>

            {/* Basic user info */}
            {registrationStep === 0 && (
                <SignUpStepZero
                    dialogOpen={isDialogOpen}
                    setDialogOpen={setIsDialogOpen}
                    setRegistrationStep={setRegistrationStep}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            )}

            {/* Password info */}
            {registrationStep === 1 && (
                <SignUpStepOne
                    dialogOpen={isDialogOpen}
                    setDialogOpen={setIsDialogOpen}
                    setRegistrationStep={setRegistrationStep}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            )}

            {/* Email verification info */}
            {/* {registrationStep === 2 && (
                <SignUpStepTwo
                    dialogOpen={isDialogOpen}
                    setDialogOpen={setIsDialogOpen}
                    setRegistrationStep={setRegistrationStep}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            )} */}

            {/* Username info */}
            {registrationStep === 3 && (
                <SignUpStepThree
                    dialogOpen={isDialogOpen}
                    setDialogOpen={setIsDialogOpen}
                    setRegistrationStep={setRegistrationStep}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            )}

            {/* Profile picture info */}
            {registrationStep === 4 && (
                <SignUpStepFour
                    dialogOpen={isDialogOpen}
                    setDialogOpen={setIsDialogOpen}
                    setRegistrationStep={setRegistrationStep}
                    customError={customError}
                    setCustomError={setCustomError}
                />
            )}

        </>
    )
}