import { FormValues } from './schema';

// Base default values for NewPatient form
export const baseFormDefaults: FormValues = {
  prefix: '',
  firstName: '',
  lastName: '',
  email: '',
  nationalId: '',
  phone: '',
  gender: '',
  bloodGroup: '',
  dob: new Date(),
  age: 0,
  photo: null,
  addrNo: '',
  addrMoo: '',
  villageName: '',
  copyAddr: false,
  currNo: '',
  currMoo: '',
  currVillageName: '',
  currSub: 'เวียง',
  currDist: 'ฝาง',
  currProv: 'เชียงใหม่',
  patientGroup: '',
  otherGroup: '',
  statusHelpSelf: false,
  statusCannotHelpSelf: false,
  needTool: false,
  toolRemark: null,
  remark: null,
  docCertHead: null,
  docCertBed: null,
  docAppointment: null,
  docOther: null,
  latitude: '',
  longitude: '',
  locationLabel: null,
};
