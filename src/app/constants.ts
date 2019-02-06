
export const constants = {
    AppName: "Ask Apollo",

    /*---------------------------- Constants in both Staging & Production ---------------------------*/

    EdocLeadSource: 'Angular-PhysicalAppointment',
    edocEncKey: '98480',
    EdocAthenticationKey: 'A3ECAC20-996B-4DD7-8452-557717024355',
    OCSourceApp: '85BB5F00-5F45-464B-8965-1F0A7E331D29~AskApolloAngular',
    AlexaRedirectUrl: 'https://pitangui.amazon.com/spa/skill/account-linking-status.html?vendorId=MB8UQTABANIUQ#',
    PRApiUrl: "https://apolloprism.com/data/",
    AdminId: 'AskApollo',
    AdminPassword: 'AskApollo',
    storeCode: 'telhel',
    WindowLocationOrigin: window.location.origin,
    DomainURL: 'https://www.askapollo.com/',
    signOutTime: 300,
    signOutTimeAlert: 15,
    defaultDummyMale: 'https://www.askapollo.com/physical-appointment/Images/DoctorImages/defaultprofilepicmale.jpg',
    defaultDummyFeMale: 'https://www.askapollo.com/physical-appointment/Images/DoctorImages/defaultprofilepicbig.jpg',
    wallet: "lms",
    ga_trackingid: 'UA-69117678-1',



    /*------------------------------------------- Production URLs Block --------------------------------------*/

    /*----------- Physical Appointment Production URLs ------------*/

    // Apiurl: 'https://www.askapollo.com/edocapiservice/api/eDocHospital/',
    // MultiSpecialityUrl: 'https://www.askapollo.com/edocapiservice/api/MultiSpecialitytoDoctors/',
    // BaseApiurl: 'https://www.askapollo.com/edocapiservice/',
    // HOPEUtilsApiUrl: 'https://www.askapollo.com/edocapiservice/api/AskApolloWeb/',
    // HRAQuestionnaireUrl: 'https://www.askapollo.com/edocapiservice/api/eDocHealtchChecks/',
    // EdocApiIdentifier: 'edocapiservice',
    // localStorageLoging:'https://www.askapollo.com/physical-appointment/',
    // isLocalStorageVariablesTracking:false,
    //healthLibraryIframeUri: 'https://www.askapollo.com/healthlib/?a='+(new Date()).getTime()',

    /*----------- Online Consultation Production URLs --------------*/

    // OCApiUrl: 'https://service.askapollo.com:44344/OnlineConsultationRest/restservice.svc/',
    // uploadReports: 'https://service.askapollo.com:44344/OnlineConsultationRest/',
    // viewDocument: 'https://www.askapollo.com/Online-Consultation/Imageview/',
    // downloadPrescriptionUrl: 'https://www.askapollo.com/online-consultation/Common/Download.aspx',
    // paymentURL: 'https://www.askapollo.com:44555/Online-Consultation/common/PaytmGatewayBridge.aspx',
    // FSSpaymentUrl: 'https://app.askapollo.com/ApolloService/apollo/pay/usingFssGatewayV1',
    // onlineCasesheetType: 'new',

    /*------------------- Identifiers Production -------------------*/

    // CancerOpinionURL: 'https://askapollo.bestopinion.net/login_with_token',
    // websiteForRedirect: 'https://www.askapollo.com',
    // isLocal: false,
    // returnURL: 'https://www.askapollo.com',



    /*------------------------------------------- Staging URLs Block --------------------------------------*/


    /*----------- Physical Appointment Staging URLs ------------*/

    Apiurl: 'http://apollostage.quad1test.com/Stage_Rest_Services/api/eDocHospital/',
    MultiSpecialityUrl: 'http://apollostage.quad1test.com/Stage_Rest_Services/api/MultiSpecialitytoDoctors/',
    BaseApiurl: 'http://apollostage.quad1test.com/Stage_Rest_Services/',
    HOPEUtilsApiUrl: 'http://apollostage.quad1test.com/Stage_Rest_Services/api/AskApolloWeb/',
    HRAQuestionnaireUrl: 'http://apollostage.quad1test.com/Stage_Rest_Services/api/eDocHealtchChecks/',
    EdocApiIdentifier: 'Stage_Rest_Services',
    localStorageLoging: 'http://apollostage.quad1test.com/Stage_PC/',
    isLocalStorageVariablesTracking: true,
    healthLibraryIframeUri: 'http://apollostage.quad1test.com/HealthLib/?a='+(new Date()).getTime(),

    /*----------- Online Consultation Staging URLs ------------*/

    OCApiUrl: 'https://staging.askapollo.com/onlinerestservice/restservice.svc/',
    uploadReports: 'https://staging.askapollo.com/onlinerestservice/',
    viewDocument: 'https://staging.askapollo.com/Online-Consultation/Imageview/',
    downloadPrescriptionUrl: 'https://staging.askapollo.com/online-consultation/Common/Download.aspx',
    paymentURL: 'https://staging.askapollo.com/online-consultation/Common/PaytmGatewayBridge.aspx',
    FSSpaymentUrl: 'https://apptest.askapollo.com/ApolloService/apollo/pay/usingFssGatewayV1',
    onlineCasesheetType: 'new',

    /*-------------------- Identifiers Staging ----------------*/

    CancerOpinionURL: 'https://askapollo.preproduction.bestopinion.net/login_with_token',
    websiteForRedirect: 'https://staging.askapollo.com',
    isLocal: false,
    returnURL: 'https://www.askapollo.com:44333/beta',

};