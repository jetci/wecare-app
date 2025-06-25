import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams } from 'next/navigation';
import { schema, FormValues } from './schema';
import { baseFormDefaults } from './formDefaults';

export function useNewPatientForm() {
  const searchParams = useSearchParams();

  const defaultValues = useMemo<FormValues>(() => ({
    prefix: searchParams?.get('prefix') ?? baseFormDefaults.prefix,
    firstName: searchParams?.get('firstName') ?? baseFormDefaults.firstName,
    lastName: searchParams?.get('lastName') ?? baseFormDefaults.lastName,
    email: searchParams?.get('email') ?? baseFormDefaults.email,
    nationalId: searchParams?.get('nationalId') ?? baseFormDefaults.nationalId,
    phone: searchParams?.get('phone') ?? baseFormDefaults.phone,
    gender: searchParams?.get('gender') ?? baseFormDefaults.gender,
    bloodGroup: searchParams?.get('bloodGroup') ?? baseFormDefaults.bloodGroup,
    dob: searchParams?.get('dob') ? new Date(searchParams.get('dob')!) : baseFormDefaults.dob,
    age: parseInt(searchParams?.get('age') ?? '', 10) || baseFormDefaults.age,
    photo: baseFormDefaults.photo,
    addrNo: searchParams?.get('addrNo') ?? baseFormDefaults.addrNo,
    addrMoo: searchParams?.get('addrMoo') ?? baseFormDefaults.addrMoo,
    villageName: searchParams?.get('villageName') ?? baseFormDefaults.villageName,
    copyAddr: searchParams?.get('copyAddr') === 'true',
    currNo: searchParams?.get('currNo') ?? baseFormDefaults.currNo,
    currMoo: searchParams?.get('currMoo') ?? baseFormDefaults.currMoo,
    currVillageName: searchParams?.get('currVillageName') ?? baseFormDefaults.currVillageName,
    currSub: searchParams?.get('currSub') ?? baseFormDefaults.currSub,
    currDist: searchParams?.get('currDist') ?? baseFormDefaults.currDist,
    currProv: searchParams?.get('currProv') ?? baseFormDefaults.currProv,
    patientGroup: searchParams?.get('patientGroup') ?? baseFormDefaults.patientGroup,
    otherGroup: searchParams?.get('otherGroup') ?? baseFormDefaults.otherGroup,
    statusHelpSelf: searchParams?.get('statusHelpSelf') === 'true',
    statusCannotHelpSelf: searchParams?.get('statusCannotHelpSelf') === 'true',
    needTool: searchParams?.get('needTool') === 'true',
    toolRemark: baseFormDefaults.toolRemark,
    remark: baseFormDefaults.remark,
    docCertHead: baseFormDefaults.docCertHead,
    docCertBed: baseFormDefaults.docCertBed,
    docAppointment: baseFormDefaults.docAppointment,
    docOther: baseFormDefaults.docOther,
    latitude: searchParams?.get('lat') ?? baseFormDefaults.latitude,
    longitude: searchParams?.get('lng') ?? baseFormDefaults.longitude,
    locationLabel: baseFormDefaults.locationLabel,
  }), [searchParams]);

  return useForm<FormValues>({ 
    resolver: yupResolver(schema) as any, 
    mode: 'onChange', 
    reValidateMode: 'onChange', 
    defaultValues 
  });
}
