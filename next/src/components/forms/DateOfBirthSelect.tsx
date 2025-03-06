import { useState } from "react";
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormTemporaryUserBasicDataType } from 'tweetly-shared';

type DateOfBirthDataType = {
    year: number;
    month: number;
    day: number;
};

type DateOfBirthProps = {
    // For new user registration process
    signUpRegister?: UseFormRegister<FormTemporaryUserBasicDataType>;
    signUpSetValues?: UseFormSetValue<FormTemporaryUserBasicDataType>;
    
    // For user settings
    settingsRegister?: UseFormRegister<DateOfBirthDataType>;
    settingsGetValues?: UseFormGetValues<DateOfBirthDataType>;
    settingsSetValues?: UseFormSetValue<DateOfBirthDataType>;
    
    errors: FieldErrors;
};

export function DateOfBirthSelect({ signUpRegister, signUpSetValues, settingsRegister, settingsGetValues, settingsSetValues, errors }: DateOfBirthProps) {
    const [currentMonth, setCurrentMonth] = useState<number | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    const todayYear = new Date().getFullYear();
    const years = Array.from(new Array(100), (_, i) => todayYear - i).filter(year => year <= todayYear - 13); // Last 100 years

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const months30 = [4, 6, 9, 11]; // April, June, September, November
    const months31 = [1, 3, 5, 7, 8, 10, 12]; // Jan, Mar, May, July, Aug, Oct, Dec
    
    const days28 = Array.from({ length: 28 }, (_, i) => i + 1);
    const days29 = Array.from({ length: 29 }, (_, i) => i + 1);
    const days30 = Array.from({ length: 30 }, (_, i) => i + 1);
    const days31 = Array.from({ length: 31 }, (_, i) => i + 1);

    // Use form registers, either sign up page form or settings page form
    const yearRegister = signUpRegister?.("year") || settingsRegister?.("year");
    const monthRegister = signUpRegister?.("month") || settingsRegister?.("month");
    const dayRegister = signUpRegister?.("day") || settingsRegister?.("day");

    // For user settings change birthday page
    // Pre-load the form with already saved data (user's current birthday)
    const savedYear = settingsGetValues?.("year");
    const savedMonth = settingsGetValues?.("month");
    const savedDay = settingsGetValues?.("day");

    const handleFieldChange = (value: string, type: 'year' | 'month' | 'day') => {
        // Zod schema validates number type, not string
        const numericValue = Number(value);

        if (signUpSetValues) {
            signUpSetValues(type, numericValue);
        } else if (settingsSetValues) {
            settingsSetValues(type, numericValue);
        }

        // Update days field which are based on current year (leap year) and month
        // Don't need to keep track of current day because no other field is connected to this field
        if (type === 'year') {
            setCurrentYear(numericValue);
        } else if (type === 'month') {
            setCurrentMonth(numericValue);
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            {!settingsGetValues && (
                <div>
                    <p className="font-bold">Date Of Birth</p>
                    <p className='text-secondary-text text-14'>
                            This will not be shown publicly. Confirm your own age, even if this account is for a business, a pet, or something else.
                    </p>
                </div>
            )}
            <div className='flex gap-2 w-full'>

                {/* Year Select */}
                <div className='flex flex-col gap-2 w-full'>
                    <Select
                        {...yearRegister}
                        onValueChange={(value) => handleFieldChange(value, 'year')}
                        defaultValue={savedYear?.toString()}
                    >
                        
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>
                    {errors.year && (
                        <p className="error-msg-date">{`${errors.year.message}`}</p>
                    )}
                </div>

                {/* Month Select */}
                <div className='flex flex-col gap-2 w-full'>
                    <Select
                        {...monthRegister}
                        onValueChange={(value) => handleFieldChange(value, 'month')}
                        defaultValue={savedMonth?.toString()}
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem key={index} value={(index + 1).toString()}>
                                    {month}
                                </SelectItem>
                            ))}
                        </SelectContent>

                    </Select>
                    {errors.month && (
                        <p className="error-msg-date">{`${errors.month.message}`}</p>
                    )}
                </div>

                {/* Day Select */}
                <div className='flex flex-col gap-2 w-full'>
                    {/* {onValueChange = {(value) => setValue("day", value)} } */}
                    <Select
                        {...dayRegister}
                        onValueChange={(value) => handleFieldChange(value, 'day')}
                        defaultValue={savedDay?.toString()}
                    >

                        <SelectTrigger>
                            <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                            {(() => {
                                if (!currentMonth) return days31; // Default to 31 days
                                if (months30.includes(currentMonth)) return days30;
                                if (months31.includes(currentMonth)) return days31;
                                if (currentYear && ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)) {
                                    return days29; // Leap year February
                                }
                                return days28; // Regular February
                            })().map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                    {day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.day && (
                        <p className="error-msg-date">{`${errors.day.message}`}</p>
                    )}
                </div>
            </div>

        </div>
    );
}