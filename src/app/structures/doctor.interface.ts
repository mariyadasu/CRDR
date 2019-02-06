export interface timeslot {
    Day: string,
    Time: string
}

export interface services {
    serviceName: string,
    specialityId: number
}

export interface doctor {
    doctorId: number,
    gender: string,
    CityName: string,
    photoURL: string,
    thumbNail: string,
    doctorName: string,
    qualification: string,
    SpecialitiesNames: string,
    keyword: string,
    MultiSpecialityName: string,
    MultiSpecialityKeyword: string,
    YearsOfExperience: number,
    LanguagesKnown: string,
    HospitalIds: string,
    availableStartEndTime: string,
    availableStartTime: string,
    availableEndTime: string,
    availableEndStartTime: string,
    availableStartEndTimeWithSeperator: string,
    availableDays: string,
    HospitalNames: string,
    notInterestedIneDoc: number,
    specialityId: number,
    MultiSpecialityId: string,
    completePhotoURL: string,
    Recommendations: number,
    ApiServicesBos: services[],
    ApiServicesBosShort: services[],
    DisplayTime: string,
    DisplayDays: string,
    IsAvailableToday: boolean,
    IsAvalableInMorning: boolean,
    IsAvailableinAfterNoon: boolean,
    IsAvailableinEvening: boolean,
    RegionalLanguage:string,
}
export interface doctorC {
    Achievements?: string
    CityId?: string
    CityName?: string
    CompletePhotoUrl?: string
    DOB?: string
    DayofWeek?: string
    DoctorId?: string
    Email?: string
    Experience?: string
    FirstName?: string
    Gender?: string
    HasEmail?: boolean
    HasVideo?: boolean
    HasVoice?: boolean
    HospitalId?: string
    HospitalName?: string
    LanguagesKnown?: string
    LastName?: string
    LocationId?: string
    LocationName?: string
    PhotoUrl?: string
    ProfessionalMemberships?: string
    Publications?: string
    Qualification?: string
    RegistrationNo?: string
    SemContent?: string
    Speciality?: string
    SpecialityId?: string
    Tariff?: string
    USD?: string
    UserId?: string,
    ApiServicesBos?: services[],
    Treatment?:string,
    ConsultationType? :string
}

export interface doctorV0 {
    userId: number,
    gender: number,
    cityId: number,
    languages: string,
    photoURL: string,
    registrationNo: string,
    experience: number,
    emailId: string,
    salutation: string,
    firstName: string,
    lastname: string,
    cityName: string,
    specialityId: number,
    specialityName: string,
    hospitalName: string,
    hospitalId: string,
    doctorSlotTimings: timeslot[],
    recommendations: number
}

export interface docDetailLocation {
    HospitalName: string,
    HospitalAddress: string,
    HospitalId: number,
    DoctorprofileSlotDayandTilmeList: timeslot[],
    Latitude: number,
    Longituge: number
}

export interface docDetailFeedback {
    review: string,
    diagnosis: string,
    name: string,
    date: Date
}

export interface docDetailInfo {
    ServicesList: services[],
    Qualification: string,
    WorkExperience: string,
    RegistrationNo: number,
    GenderInteger: number,
    GenderString: string,
    AwardsandAchievements: string,
    researchandPublications: string,
    Summary: string,
    ProfessionalMemberships: string

}

export interface docDetailHealthFeed {
    FeedbackList: docDetailFeedback[],
    Publlications: string,
    VideoUrl: string
}

export interface docDetailSummary {
    docId: number,
    docName: string,
    docPhotoURL: string,
    docCity: string,
    docSpeciality: string,
    docSpecialityId?: string,
    docQualification: string,
    notInterestedIneDoc?:any,
    specialityId?:any,
    IsInterestedInEdoc?:any
}

export interface docDetailSummaryC {
    docId: string,
    docName: string,
    docPhotoURL: string,
    docCity: string,
    docSpeciality: string,
    docQualification: string,
    notInterestedIneDoc?:any,
    specialityId?:any
}

export interface docPageTitleandDescription {
    PageTitle: string,
    PageDescription: string
}
export interface docDetail {
    CompletePhotoURL: string,
    DoctorId: number,
    DoctorName: string,
    Qualification: string,
    MultiSpecialtyId: number,
    MultiSpeciltyKeyword: string,
    YearsofExperience: number,
    LanguagesNames: string,
    HospitalNames: string,
    DoctorLocationtabList: docDetailLocation[],
    DoctorInfotabList: docDetailInfo[],
    DoctorHealthFeedtabList: docDetailHealthFeed[],
    DoctorPageTitleandDescription: docPageTitleandDescription,
    objSEOSchemaonDoctorProfile: doctorProfileSchema,
    IsInterestedInEdoc?:any,
    notInterestedIneDoc?:any,
    RegionalLanguage:string,
    ProfessionalMemberships?:string,
    SpecialInterest?: string
}

export interface docDetailC {
    CompletePhotoURL: string,
    DoctorId: number,
    DoctorName: string,
    Qualification: string,
    MultiSpecialtyId: number,
    MultiSpeciltyKeyword: string,
    YearsofExperience: number,
    LanguagesNames: string,
    HospitalNames: string,
    DoctorLocationtabList: docDetailLocation[],
    DoctorInfotabList: docDetailInfo[],
    DoctorHealthFeedtabList: docDetailHealthFeed[],
    DoctorPageTitleandDescription: docPageTitleandDescription,
    notInterestedIneDoc?:any
}
export interface doctorsIndex{

    FullName: string,
    UrlFullName: string,
    SpecilaityKeyword: string,
    UrlSpecialityKeyword: string,
    CityName: string,
    UrlCityName: string,
    Gender: number
}

export interface doctorProfileSchema{

    '@context'?: string,
    '@type'?:string,
     name?:string,
     areaServed?:string,
     image?:string,
     telePhone?:string,
     url?:string,
     description?:string,
     paymentAccepted?:string[],
     availableService?:string[],
     openingHours?:string,
     priceRange?:string,
     geo?:geolocation,
}

export interface geolocation{
    
    "@type"?:string,
    latitude?:number,
    longitude?:number    
}

export interface breadcrumbsDocProfileSchema{
    "@context"?:string,
    "@type"?:string,
    itemListElement?: itemListElement[],
}
export interface itemListElement{
    "@type"?:string,
     position?:number,
     item?: item,
}
export interface item {
    "@id"?:string,
     name?:string,
     image?:string
}
export interface doctorNew 
{
    objAPIRDoctorSearchPageModelBO:[
        {
            doctorId: number,
            gender: string,
            CityName: string,
            photoURL: string,
            thumbNail: string,
            doctorName: string,
            qualification: string,
            SpecialitiesNames: string,
            keyword: string,
            MultiSpecialityName: string,
            MultiSpecialityKeyword: string,
            YearsOfExperience: number,
            LanguagesKnown: string,
            HospitalIds: string,
            availableStartEndTime: string,
            availableStartTime: string,
            availableEndTime: string,
            availableEndStartTime: string,
            availableStartEndTimeWithSeperator: string,
            availableDays: string,
            HospitalNames: string,
            notInterestedIneDoc: number,
            specialityId: number,
            MultiSpecialityId: string,
            completePhotoURL: string,
            Recommendations: number,
            ApiServicesBos: services[],
            ApiServicesBosShort: services[],
            DisplayTime: string,
            DisplayDays: string,
            IsAvailableToday: boolean,
            IsAvalableInMorning: boolean,
            IsAvailableinAfterNoon: boolean,
            IsAvailableinEvening: boolean,
            FilterSet: string,
            RegionalLanguage:string,
            HospitalTypes: string,
            objSEOSchemaonDoctorProfile: seoSchemeDocProfile[]
        }
    ],
    objAPITitleandDescriptionBO: {
        PageTitle: string,
        PageDescription: string,
        PageContent: string
    },
    objSEOSchemaonDoctorSearchPageForHospitalInfo?: seoSchemeDocProfile[],
    MaxPaginationLength?:number,
    AvailableAlphabets?:any
    TotalRecords?:number,
    LanguagesAvailable?:string[]
}
export interface seoSchemeDocProfile
{
    "@context"?:string,
    "@type"?:string,
    name: string,
    areaServed: string,
    address: {
        type: string,
        streetAddress: string,
        addressLocality: string,
        addressRegion: string,
        postalCode: string
    },
    image: string,
    telePhone: string,
    url: string,
    description: string,
    aggregateRating: {
        "@type": string,
        worstRating: number,
        bestRating: number,
        ratingValue: string,
        reviewCount: number
    },
    paymentAccepted: string[],
    availableService: string[],
    openingHours: string,
    openingHoursSpecification: string[],
    geo: {
        "@type": string,
        latitude: string,
        longitude: string
    },
    priceRange: string
}



// export interface latlong {
//     latitude: number,
//     longitude: number
// }

// export interface docDetailV0 {
//     userId: number,
//     gender: number,
//     qualification: string,
//     cityId: number,
//     photoURL: string,
//     registrationNo: string,
//     experience: number,
//     emailId: string,
//     salutation: string,
//     firstName: string,
//     lastname: string,
//     cityName: string,
//     specialityId: number,
//     specialityName: string,
//     hospitalName: string,
//     hospitalId: string,
//     doctorSlotTimings: timeslot[],
//     recommendations: number,
//     age: number,
//     hospitalAddress: string[],
//     languagesSpoken: string,
//     listfeedBackBO: string[],
//     listlatitudeLangitude: latlong[]
// }

// export interface docDetailV1{
//     apiServicesBos: services[],
//     achievements: string,
//     autoId: number,
//     doctorId: number,
//     completePhotoURL: string,
//     createdBy: string,
//     createdIP: string,
//     createdOn: string,
//     doctorName: string,
//     errorMessage: string,
//     experience: string,
//     gender: number,
//     hasError: boolean,
//     hospitalId: number,
//     hospitalName: string,
//     hospitalType: number,
//     isActive: boolean,
//     iseDocDoctor: boolean,
//     isMedMantraFallows: string,
//     isMoreHospitalsExist: number,
//     isTeleMedicineDoctor: boolean,
//     languages: string,
//     languagesKnown: string,
//     locationID: number,
//     mmDoctorId: number,
//     mmHospitalId: number,
//     modifiedBy: number,
//     modifiedIP: string,
//     modifiedOn: string,
//     notInterestedIneDoc: number,
//     patientCount: number,
//     photoURL: string,
//     professionalMemberships: string,
//     publications: string,
//     qualification: string,
//     registrationNo: string,
//     rspecialityBO: string,
//     tariff: string,
//     userId: number,
//     wingId: number,
//     wingName: string,
//     mobileNo: string,
//     workExperience: string,
//     firstName: string,
//     lastName: string,
//     address: string,
//     specialities: string,
//     availableDays: string,
//     availableStartTime: string,
//     availableStartEndTime: string,
//     availableEndStartTime: string,
//     availableEndTime: string,
//     locations: string,
//     specialitiesNames: string,
//     hospitalIds: string,
//     hospitalNames: string,
//     hospitalIdsWithType: string,
//     hospitalIdsWithName: string,
//     availableStartEndTimeWithSeperator: string,
//     cityName: string,
//     countryName: string,
//     keyword: string,
//     mmSpecialityId: number,
//     yearsOfExperience: number,
//     research: string,
//     specialityContent: string,
//     superSpeciality: string,
//     specialInterests: string,
//     videoUrl: string,
//     serviceId: number,
//     serviceName: string,
//     serviceTypeId: number,
//     serviceTypeName: string,
//     isDeleted: boolean,
//     specialityId: number,
//     summary: string,
//     cityId: number,
//     hyperLocation: string,
//     boilerContentType: number,
//     subSpecialityId: number,
//     emailId: string,
//     dateOfBirth: string,
//     pincode: number,
//     countryId: number,
//     stateId: number,
//     phoneNo: string,
//     hashKey: string,
//     roleId: number,
//     salutationId: number,
//     isAskApolloDoctor: boolean,
//     followUpTariff: string,
//     thumbNail: string,
//     iddocIdEmail: string,
//     approvedEmail: string,
//     appointmentDateTimeDiff: number,
//     currentServerDate: string,
//     currentServerTime: string,
//     appointmentAvailableDate: string,
//     appointmentAvailableTime: string,
//     recommendations: string,
//     specialityName: string,
//     password: string,
//     salutation: string,
//     stateName: string,
//     userType: number,
//     subSpecialityName: string,
//     specialityGroupId: number,
//     specialityGroupName: string,
//     todayDayId: number,
//     tomorrowDayId: number,
//     isOnlinePaymentAllowed: number,
//     doctorOfTheDay: number,
//     showTariif: boolean,
//     tempRecordCount: number,
//     isTempRecord: number,
//     multiSpecialityKeyword: string,
//     multiSpecialityName: string,
//     multiSpecialityId: string,
//     boilerContentValue: string
// }



