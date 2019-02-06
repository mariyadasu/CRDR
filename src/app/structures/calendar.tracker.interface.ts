import { UHID } from '@aa/structures/user.interface';
export interface calendarTracker {
    docId: number;
    hosId: number;
    dates: string[];
}

export interface appointmentSlot {
    slotId: number,
    slotTime: string
}

export interface appointmentSlotsTracker {
    docId: number;
    date: string;
    morningSlots: appointmentSlot[];
    afternoonSlots: appointmentSlot[];
    eveningSlots: appointmentSlot[];
    nightSlots: appointmentSlot[];
    morningSlotRequestApptEnabled?: boolean;
    afternoonSlotRequestApptEnabled?: boolean;
    eveningSlotRequestApptEnabled?: boolean;
    nightSlotRequestApptEnabled?: boolean;
}

export interface currentAppointment {
    docId: string,
    docName: string,
    docPhotoURL: string,
    docCity: string,
    docHospital: string,
    docHospitalAddress: string,
    docHospitalGMapLink: string,
    docSpeciality: string,
    docQualification: string,
    hosId: string,
    date?: string,
    timeSlot?: string,
    DisplayTime?:string,
    slotId?: number,
    mode?:string,
    feeInr?:number,
    feeUsd?:number,
    feeTypeInr?:string,
    feeTypeUsd?:string,
    docSpecialityId?:any
    locationId?:any
    edocDocId?:any,
    appointmentId?:string
}

export interface patientInfo {
    fn: string,
    ln: string,
    email: string,
    gender: number,
    pn: string,
    uhid: string,
    pnv: boolean,
    dob: string
}

export interface aaDateSlotObject {
    fullDate: string,
    weekday: string,
    date: number,
    month: string
}
export interface appointmentSlotNew {
    Apdate: string,
    Result_id: string,
    SlotTime:string
}