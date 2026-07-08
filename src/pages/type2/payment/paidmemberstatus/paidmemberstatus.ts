import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { ParentClub } from '../../../../shared/model/club.model';
import { report_model } from '../model/report.model';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from 'graphql-tag';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';

/**
 * Generated class for the PaidmemberstatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-paidmemberstatus',
  templateUrl: 'paidmemberstatus.html',
  providers: [HttpService]
})
export class PaidmemberstatusPage {
  showType: any = "";
  memberList: report_model[] = [];
  parentClubKey: string = "";
  termKey: string = "";
  reportType: string = "";
  parentClubInfo: any = {};
  selectOBj: SelectedItems;  
  parentclub_email:string; 
  userObj:any = "";
  nestUrl = "";
  report_obj = {
    parentclub_image: "",
    parentclub_name: "",
    club_name:"Not Available",
    to_address:"",
    from_address:"Not Available",
    cc_address:"Not Available",
    subject:"Not Available",
    reply_to_address:"",
    memer_list:[],
    msg_body:"",
    attachment_name:""
  }
  type:number;
  report_members:report_model[] = [];
  constructor(public sharedservice: SharedServices, 
    public commonService: CommonService, 
    public loadingCtrl:LoadingController, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public fb: FirebaseService,
    public toastCtrl:ToastController,
    public actionSheetCtrl:ActionSheetController,
    public storage:Storage,
    private graphqlService:GraphqlService,
    private httpService: HttpService) {
    this.selectOBj = new SelectedItems();
    this.nestUrl = this.sharedservice.getnestURL();
    this.showType = this.navParams.get('showType');
    if(this.showType == 'due'){
      this.selectOBj.isDue = true;
      this.report_obj.subject = "Payment Report: Due Members"
    }else if(this.showType == 'paid'){
      this.report_obj.subject = "Payment Report: Paid Members"
    }
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
          this.parentClubKey = val.UserInfo[0].ParentClubKey;
          this.userObj = val;
          this.getParentClubInfo();
      }
      // this.loading.dismiss().catch(() => { });
  })

    this.memberList = this.navParams.get('memberList');
    this.reportType = this.navParams.get('reportType');
    console.log(this.memberList);
    
    //this.preparememberObj()
  }

  getParentClubInfo() {
    this.storage.get("postgre_parentclub").then((parentclub:ParentClub) => {  
      if (parentclub != null) {
          //this.parentClubDetails = parentclub;
          //this.emailObj.Message += "\n\n\n\nKind Regards,\n" + this.parentClubDetails.ParentClubName + "\n";
          this.parentclub_email = parentclub.ParentClubAdminEmailID
          this.report_obj.parentclub_image = parentclub.ParentClubAppIconURL;
          this.report_obj.parentclub_name = parentclub.ParentClubName;
          this.report_obj.to_address = parentclub.ParentClubAdminEmailID;
          if(this.userObj.RoleType == 6 || this.userObj.RoleType == 7 || this.userObj.RoleType == 8){
            this.report_obj.to_address = this.userObj.EmailID;
          }
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaidmemberstatusPage');
  }
  cancelsendMailToParentClub() {
    this.navCtrl.pop();
  }
  sendMailToParentClub() {
    console.log(this.selectOBj);
   // let url = "http://localhost:32682/"
    // $.ajax({
     
    //   url: url+"umbraco/surface/ActivityProSurface/CreatePDFforSessionPaidMember/",
    //   data: this.selectOBj,
    //   type: "POST",
    //   success: function (response) {
    //     console.log(response)
    //    // this.showToast("Report has been sent",2000)
    //   }, error: function (error, xhr) {
    //     this.showToast("Please try again",2000)
    //   }
    // });
    this.commonService.toastMessage("Report sent successfully to your email",2500,ToastMessageType.Success,ToastPlacement.Bottom);
   // this.navCtrl.pop();
  }
  
  // preparememberObj() {
  //   let selectedMemberArr = [];

  //   this.memberList.forEach((member) => {
  //     let tempMemberObj: Member = new Member();
  //     tempMemberObj.coachName = member.Coach;
  //     if (member.TransactionDate != undefined) {
  //       tempMemberObj.date = member.TransactionDate;
  //     } else {
  //       tempMemberObj.date = "Not Available";
  //     }
  //     if (member.DiscountAmountIncludingCharges != undefined) {
  //       tempMemberObj.discAmount = member.DiscountAmountIncludingCharges;
  //     } else {
  //       tempMemberObj.discAmount = "Not Available";
  //     }
  //     if (member.PaidBy != undefined) {
  //       tempMemberObj.mode = member.PaidBy;
  //     } else {
  //       tempMemberObj.mode = "Not Available";
  //     }
  //     if (member.AmountPaid != undefined) {
  //       tempMemberObj.paidAmount = member.AmountPaid;
  //     } else {
  //       tempMemberObj.paidAmount = "Not Available";
  //     }
  //     if (member.SessionName != undefined) {
  //       tempMemberObj.sessionName = member.SessionName;
  //     } else {
  //       tempMemberObj.sessionName = "Not Available";
  //     }
  //     if (member.ClubName != undefined) {
  //       tempMemberObj.venueName = member.ClubName;
  //     } else {
  //       tempMemberObj.venueName = "Not Available";
  //     }
  //     //if (member.AmountDue != undefined ) {
  //     if (member.DueAmount != undefined ) {
  //       tempMemberObj.dueAmount = member.AmountDue ? member.AmountDue : member.DueAmount;
  //     } else {
  //       tempMemberObj.dueAmount = "Not Available";
  //     }
  //     tempMemberObj.firstName = member.FirstName;
  //     tempMemberObj.lastName = member.LastName;
  //     tempMemberObj.member_type = member.IsEnable ? "Member" : "Non-Member"
  //     selectedMemberArr.push(tempMemberObj);
  //   });
  //   this.selectOBj.memerList = selectedMemberArr;
  //   console.log(this.selectOBj.memerList);
  // }
  

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
        title: 'Send Report',
        buttons: [
            {
                text: 'PDF',
                handler: () => {
                    this.sendPDF();
                }
            }, {
                text: 'Excel',
                handler: async() => { 
                  this.sendXLS();
                }  
              }
        ]
    });
    actionSheet.present();
}

    
   
  
sendPDF(){
  try{
     this.commonService.showLoader("Please wait");
      this.memberList.forEach((mem)=>{
        if(!this.selectOBj.isCoach){
          delete mem.Coach;
        }if(!this.selectOBj.isDiscount){
          delete mem.Discount;
        }
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.PaidBy;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.Session;
        }
        if(!this.selectOBj.isVanue){
          delete mem.Venue;
        }
      })
      
      this.report_obj.memer_list = this.memberList;
      //this.selectOBj.ccAddress = this.parentClubInfo.ParentClubAdminEmailID;
      //this.report_obj.to_address="vinodkumar1993.09@gmail.com";//need to remove
      this.report_obj.msg_body = `<p> Hello ${this.report_obj.parentclub_name},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`;
      this.report_obj.attachment_name = `Payment_report@${this.report_obj.parentclub_name+ new Date().getTime()}`;
      console.log(this.report_obj);
      const report_mutation = gql`
        mutation sendSessionReport($reportInput: ReportModel_V1!) {
          sendSessionReport(sessionReportInput: $reportInput)
        }` 
        
        const report_variable = { reportInput: this.report_obj };
        this.graphqlService.mutate(report_mutation, report_variable,0).subscribe((response)=>{
          this.commonService.hideLoader();
          this.commonService.toastMessage("Report sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
          this.navCtrl.pop();
          //this.navCtrl.remove(this.navCtrl.getActive().index - 1, 2);
        },(err)=>{
          this.commonService.hideLoader();
          if(err.error != undefined){
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }else{
            this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }
        }); 
      // $.ajax({
      //   url:`${this.nestUrl}/session/printreport`,
      //   data: this.selectOBj,
      //   type: "POST",
      //    success: function (response) {
      //       res(response)
      //   }, error: function (error, xhr) {
      //     rej(error)
      //     //that.showToast("Please try again",2000)
      //   }
      // }); 
    }catch(err){
      this.commonService.hideLoader();
      this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
      
  } 


  sendXLS(){
    try{
      this.commonService.showLoader("Please wait");
      this.selectOBj.memerList.forEach((mem)=>{
        if(!this.selectOBj.isCoach){
          delete mem.Coach;
        }if(!this.selectOBj.isDiscount){
          delete mem.Discount;
        }
        if(!this.selectOBj.isDue){
          delete mem.DueAmount;
        }
        if(!this.selectOBj.isMode){
          delete mem.PaidBy;
        }
        if(!this.selectOBj.isPaid){
          delete mem.PaidAmount;
        }
        if(!this.selectOBj.isSession){
          delete mem.Session;
        }
        if(!this.selectOBj.isVanue){
          delete mem.Venue;
        }
      })
      let sentObj = {
          toAddress: this.report_obj.to_address,
          fromAddress:'activitypro17@gmail.com',
          ccAddress:this.parentclub_email,
          bccAddress:'',
          attachmentType:'XLS',
          attachmentName:`Payment_report@${this.selectOBj.parentClubName+ new Date().getTime()}`,
          attachmentData:this.memberList,
          aplicationType:'Activitypro',
          subject:`${this.report_obj.subject}@${this.report_obj.parentclub_name}`,
          msgBody:`<p> Hello ${this.report_obj.parentclub_name},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
      }
      this.httpService.post(`${API.ATTACHMENT_EMAIL}`, sentObj).subscribe((res: any) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Report sent successfully",2500,ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();
      }, (err) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom); 
      });
    }catch(error){
      this.commonService.hideLoader();
      this.commonService.toastMessage("Report sent failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }  
  }



//   sendXLS(emailObj) { 
//     return new Promise(async(res,rej)=>{
//         try{
//             let sentObj = {
//                 toAddress: emailObj.ParentClubEmail,
//                 fromAddress:'activitypro17@gmail.com',
//                 ccAddress:'',
//                 bccAddress:'',
//                 attachmentType:'XLS',
//                 attachmentName:`Member_report@${this.clubName + new Date().getTime()}`,
//                 attachmentData:emailObj.Members,
//                 aplicationType:'Activitypro',
//                 subject:`Member Report of ${this.clubName}`,
//                 msgBody:`<p> Hello ${this.clubName},</p><p style="margin:1px">Please find below the link for the report.</p><p>Note: The link will be disabled after 3 days. </p>`
//             }
//            // url:"https://topgradez.appspot.com/messege/sendattachment"
//             $.ajax({
//                 url:"https://activitypro-nest-261607.appspot.com/superadmin/attachmentemail",
//                 data: sentObj,
//                 type: "POST",
//                 success: function (response) {
//                    res(response)
//                 }, error: function (error, xhr) {
//                     rej(error);
//                 }
//             });
//             this.navCtrl.pop()
//         }catch(err){
//             rej(err)
//         }
//     })
   
// }


  
}
class SelectedItems {
  parentClubimagePath: string = "";
  parentClubName: string = "";
  clubName: string = "Not Available";
  toAddress: string = "";
  fromAddress: string = "Not Available";
  ccAddress: string = "Not Available";
  subject: string = "Not Available";
  replyToAddress: Array<string> = [];
  memerList:report_model[] = [];
  msgBody:string = "";
  attachmentName:string = "";
  isFirstName: boolean = true;
  isLastName: boolean = true;
  isSession: boolean = false;
  isCoach: boolean = false;
  isVanue: boolean = false;
  isDate: boolean = false;
  isMode: boolean = false;
  isDiscount: boolean = false;
  isPaid: boolean = false;
  isDue:boolean = false;
}

