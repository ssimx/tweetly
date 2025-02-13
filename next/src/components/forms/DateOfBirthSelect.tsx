import { useState } from "react";
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type DateOfBirthDataProps = {
    year: string;
    month: string;
    day: string;
};

type SignUpFormFields = DateOfBirthDataProps & {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type SettingsFormFields = DateOfBirthDataProps;

type DateOfBirthProps = {
    signUpRegister?: UseFormRegister<SignUpFormFields>;
    signUpSetValues?: UseFormSetValue<SignUpFormFields>;
    settingsRegister?: UseFormRegister<SettingsFormFields>;
    settingsGetValues?: UseFormGetValues<DateOfBirthDataProps>;
    settingsSetValues?: UseFormSetValue<SettingsFormFields>;
    errors: FieldErrors;
};

export function DateOfBirthSelect({ signUpRegister, signUpSetValues, settingsRegister, settingsGetValues, settingsSetValues, errors }: DateOfBirthProps) {
    const [currentMonth, setCurrentMonth] = useState<string | null>(null);
    const [currentYear, setCurrentYear] = useState<number | null>(null);
    
    const todayYear = new Date().getFullYear();
    const years = Array.from(new Array(100), (_, i) => todayYear - i).filter(year => year <= todayYear - 13); // Last 100 years
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const months30 = ['4', '6', '9', '11'];
    const months31 = ['1', '3', '5', '6', '7', '8', '9', '10', '11', '12'];
    const days28 = Array.from({ length: 28 }, (_, i) => i + 1);
    const days29 = Array.from({ length: 29 }, (_, i) => i + 1);
    const days30 = Array.from({ length: 30 }, (_, i) => i + 1);
    const days31 = Array.from({ length: 31 }, (_, i) => i + 1);

    // registers
    const yearRegister = signUpRegister
        ? signUpRegister("year")
        : settingsRegister
            ? settingsRegister("year")
            : undefined;

    const monthRegister = signUpRegister
        ? signUpRegister("month")
        : settingsRegister
            ? settingsRegister("month")
            : undefined;

    const dayRegister = signUpRegister
        ? signUpRegister("day")
        : settingsRegister
            ? settingsRegister("day")
            : undefined;   

    // Saved values for settings
    const savedYear = settingsGetValues?.("year");
    const savedMonth = settingsGetValues?.("month");
    const savedDay = settingsGetValues?.("day");

    const handleFieldChange = (value: string, type: 'year' | 'month' | 'day') => {
        signUpSetValues?.(type, String(value)) ?? settingsSetValues?.(type, String(value));
        type === 'year' ? setCurrentYear(Number(value)) : setCurrentMonth(String(value));
    };

    return (
        <div className='flex flex-col gap-2'>
            {!settingsGetValues && <p className="font-bold">Date Of Birth</p>
}
            <div className='flex gap-2 w-full'>
                {/* Year Select */}
                <div className='flex flex-col gap-2 w-full'>
                    {/* {} */}
                    <Select {...yearRegister} onValueChange={(value) => handleFieldChange(value, 'year')} defaultValue={savedYear}>
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
                    {/* {onValueChange = {(value) => onMonthChange(value)} } */}
                    <Select {...monthRegister} onValueChange={(value) => handleFieldChange(value, 'month')} defaultValue={savedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => (
                                <SelectItem key={index} value={String(index + 1)}>
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
                    <Select {...dayRegister} onValueChange={(value) => handleFieldChange(value, 'day')} defaultValue={savedDay}>
                        <SelectTrigger>
                            <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                            {currentMonth === null
                                ? days31.map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                        {day}
                                    </SelectItem>
                                ))
                                : months30.includes(currentMonth)
                                    ? days30.map((day) => (
                                        <SelectItem key={day} value={day.toString()}>
                                            {day}
                                        </SelectItem>
                                    ))
                                    : months31.includes(currentMonth)
                                        ? days31.map((day) => (
                                            <SelectItem key={day} value={day.toString()}>
                                                {day}
                                            </SelectItem>
                                        ))
                                        : currentYear
                                            ? (((currentYear % 4 == 0) && (currentYear % 100 != 0)) || (currentYear % 400 == 0))
                                                ? days29.map((day) => (
                                                    <SelectItem key={day} value={day.toString()}>
                                                        {day}
                                                    </SelectItem>
                                                ))
                                                : days28.map((day) => (
                                                    <SelectItem key={day} value={day.toString()}>
                                                        {day}
                                                    </SelectItem>
                                                ))
                                            : days28.map((day) => (
                                            <SelectItem key={day} value={day.toString()}>
                                                {day}
                                            </SelectItem>
                                            ))
                            }
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