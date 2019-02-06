export interface city {
    id: string;
	name: string;
	cityType: number;
}

export interface trend {
    SpecialityKeyword: string,
    HyperLocation: string,
    DisplayText: string
}

export interface occity{
	CityId:number,
	CityName:string
}

export interface clanguageIndex{
	CityName:string,
	UrlCityName:string,
	LanguagesList:string,
	LanguageName:string,
	UrlLanguageName:string,

}
export interface spCityIndex{
	CityName:string,
	UrlCityName:string,
	SpecialityId:number,
	Keyword:string,
	UrlKeyword:string,
}

export interface spGroupCityIndex{
	CityName:string,
	UrlCityName:string,
	SpecialityId:number,
	Keyword:string,
	UrlKeyword:string,
	SpecilaityGroupId:number,
	SpecialityGroupName:string
}

export interface cityHospitalIndex{
	
	CityName:string,
	HospitalName:string,
	UrlHospitalName:string,
	HospitalId:number,
	CityId:number
}

export interface cityLocalityIndex{
	CityName:string,
	CityId:number,
	HyperLocation:string,
	UrlHyperLocation:string
}