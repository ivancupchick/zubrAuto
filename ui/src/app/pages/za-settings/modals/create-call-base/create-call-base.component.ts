import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { CarService } from 'src/app/services/car/car.service';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'za-create-call-base',
  templateUrl: './create-call-base.component.html',
  styleUrls: ['./create-call-base.component.scss'],
  providers: [
    UserService,
    CarService
  ]
})
export class CreateCallBaseComponent implements OnInit {
carsControlscarsControls: any;
  get formNotValid() {
    const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return this.selectedContactUser === 'None' || !link;
  };
  loading = false;

  link = '';
  contactCenterUsers: { value: string, key: string }[] = [];
  selectedContactUser: string = 'None';

  form: UntypedFormGroup | null = null;
  activeIndex = 0;

  constructor(
    private userService: UserService,
    private carService: CarService,
    private sessionService: SessionService,
    private fb: UntypedFormBuilder,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) { }

  get carsControls(): UntypedFormControl[] {
    return (this.form!.get('cars') as UntypedFormArray).controls as  UntypedFormControl[]
  }

  deleteCarsItem(index: number) {
    (this.form!.get('cars') as UntypedFormArray).removeAt(index);
  }

  addOneCarsItem() {
    (this.form!.get('cars') as UntypedFormArray).push(this.fb.control(''));
  }

  ngOnInit(): void {
    this.loading = true;

    this.userService.getUsers()
      .subscribe(users => {
        this.contactCenterUsers = [
          { value: 'Никто', key: 'None' },
          ...users
            .filter(u => u.customRoleName === ServerRole.Custom.contactCenter
                      || u.customRoleName === ServerRole.Custom.contactCenterChief
                      || (this.sessionService.isRealAdminOrHigher && (u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin)) )
            .map(u => ({ value: `${FieldsUtils.getFieldStringValue(u, FieldNames.User.name)}`, key: `${u.id}` }))
        ];
        this.loading = false;

        this.form = this.fb.group({
          specialist: [null],
          cars: this.fb.array([this.fb.control('')])
        });
      }, () => { this.loading = false; });
  }

  cancel() {
    this.ref.close(false);
  }

  create() {
    this.loading = true;

    this.carService.createCarsByLink(this.link, +this.selectedContactUser).subscribe(res => {
      alert('Новые машины успешно добавлены');
      this.loading = false;
    }, e => {
      console.error(e);
      alert('Новые машины не добавлены');
      this.loading = false;
    })
  }

  pushManualCars() {
    if (!this.form?.valid) {
      this.form?.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.carService.createManualCars(this.form?.value).subscribe(res => {
      alert('Новые машины успешно добавлены');
      this.loading = false;
    }, e => {
      console.error(e);
      alert('Новые машины не добавлены');
      this.loading = false;
    })
  }

}
