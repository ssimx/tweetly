import { useEffect, useState } from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { signUpSchema } from "@/lib/schemas";
import { z } from "zod";

type FormData = z.infer<typeof signUpSchema>;

type DateOfBirthSelectProps = {
    register: UseFormRegister<FormData>;
    setValue: UseFormSetValue<FormData>;
    errors: FieldErrors;
};

export function DateOfBirthSelect({ register, setValue, errors }: DateOfBirthSelectProps) {
    const [currentMonth, setCurrentMonth] = useState<string | null>(null);
    
    const years = Array.from(new Array(100), (_, i) => new Date().getFullYear() - i); // Last 100 years
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const months30 = ['4', '6', '9', '11'];
    const months31 = ['1', '3', '5', '6', '7', '8', '9', '10', '11', '12'];
    const days29 = Array.from({ length: 29 }, (_, i) => i + 1);
    const days30 = Array.from({ length: 30 }, (_, i) => i + 1);
    const days31 = Array.from({ length: 31 }, (_, i) => i + 1);

    // Use useEffect to set the default values if needed
    useEffect(() => {
        setValue("year", ""); // Initialize empty values
        setValue("month", "");
        setValue("day", "");
    }, [setValue]);

    const onMonthChange = (value: string) => {
        setValue("month", value);
        setCurrentMonth(value);
    };

    return (
        <div className='flex flex-col gap-2'>
            <p className="font-bold">Date Of Birth</p>

            <div className='flex gap-2 w-full'>
                {/* Year Select */}
                <div className='flex flex-col gap-2 w-full'>
                    <Select {...register("year")} onValueChange={(value) => setValue("year", value)}>
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
                    <Select {...register("month")} onValueChange={(value) => onMonthChange(value)}>
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
                    <Select {...register("day")} onValueChange={(value) => setValue("day", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                            {currentMonth === null
                                ? days31.map((day) => (
                                    <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                        {day}
                                    </SelectItem>
                                ))
                                : months30.includes(currentMonth)
                                    ? days30.map((day) => (
                                        <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                            {day}
                                        </SelectItem>
                                    ))
                                    : months31.includes(currentMonth)
                                        ? days31.map((day) => (
                                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
                                                {day}
                                            </SelectItem>
                                        ))
                                        : days29.map((day) => (
                                            <SelectItem key={day} value={day.toString().padStart(2, '0')}>
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