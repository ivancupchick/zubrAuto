import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { StringHash } from 'src/app/entities/constants';
import {
  FieldDomains,
  FieldType,
  FlagField,
  getAccessName,
  getDomainName,
  ServerField,
} from 'src/app/entities/field';
import { AccessChip } from 'src/app/entities/fieldAccess';
import { ServerRole } from 'src/app/entities/role';
import { RoleService } from 'src/app/services/role/role.service';
import { SelectAccessComponent } from '../../../modals/select-access/select-access.component';
import { settingsUsersStrings } from '../../../settings-users/settings-users.strings';
import { finalize } from 'rxjs';

@Component({
  selector: 'za-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.scss'],
  providers: [DialogService, RoleService],
})
export class FieldFormComponent implements OnInit {
  FieldType = FieldType;

  isVisibleVariants = false;
  loading = false;

  private originalAccesses: AccessChip[] = [];

  types = [
    { name: 'Textbox', code: FieldType.Text },
    { name: 'Boolean', code: FieldType.Boolean },
    { name: 'Multiselect', code: FieldType.Multiselect },
    { name: 'Radio Button', code: FieldType.Radio },
    { name: 'Dropdown', code: FieldType.Dropdown },
    { name: 'Textarea(больше 255)', code: FieldType.Textarea },
  ];

  roles: ServerRole.Response[] = [];

  formGroup!: UntypedFormGroup;
  @Input() field!: ServerField.Response | null;
  @Input() domain!: FieldDomains;

  @Output() changed = new EventEmitter<boolean>();

  private valid = false;

  constructor(
    private fb: UntypedFormBuilder,
    private dialogService: DialogService,
    private roleService: RoleService,
  ) {}

  getRoleName(systemName: string) {
    if ((settingsUsersStrings as StringHash)[systemName]) {
      return (
        (settingsUsersStrings as StringHash)[systemName] || 'Default Title'
      );
    }

    return systemName;
  }

  ngOnInit(): void {
    this.loading = true;

    this.formGroup = this.fb.group({
      name: [this.field ? this.field.name : '', Validators.required],
      type: [
        this.field ? this.field.type : FieldType.Text,
        Validators.required,
      ],
      variants: [this.field ? this.field.variants : ''],
      accesses: [this.originalAccesses],
      isSystem: [
        this.field ? FlagField.Is(this.field, FlagField.Flags.System) : false,
      ],
      isVirtual: [
        this.field ? FlagField.Is(this.field, FlagField.Flags.Virtual) : false,
      ],
    });

    this.formGroup.valueChanges.subscribe((data) => {
      this.valid = this.formGroup.valid;
      this.changed.emit(this.valid);
      this.isVisibleVariants =
        data.type === FieldType.Radio ||
        data.type === FieldType.Multiselect ||
        data.type === FieldType.Dropdown;
    });

    this.formGroup.controls['accesses'].disable();

    this.roleService
      .getRoles()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((roles) => {
        this.roles = roles;

        if (this.field) {
          this.originalAccesses = this.field.accesses.map(
            (access: { domain: any; sourceId: any; access: number }) => ({
              domainName: getDomainName(access.domain),
              sourceName: this.getRoleName(
                roles.find((role) => role.id === access.sourceId)?.systemName ||
                  '',
              ),
              accessName: getAccessName(access.access),
              ...access,
            }),
          );

          this.setAccessesToForm(this.originalAccesses);
        }
      });
  }

  getValue(): ServerField.CreateRequest {
    const field = {
      flags: 0,
      type: this.formGroup.controls['type'].value,
      name: this.formGroup.controls['name'].value,
      domain: this.domain,
      variants: this.isVisibleVariants
        ? this.formGroup.controls['variants'].value
        : '',
      showUserLevel: 0,
      accesses: (this.formGroup.controls['accesses'].value as AccessChip[]).map(
        (ac) => ({
          sourceId: ac.sourceId,
          domain: ac.domain,
          access: ac.access,
        }),
      ),
    };

    if (this.formGroup.controls['isSystem'].value) {
      FlagField.setFlagOn(field, FlagField.Flags.System);
    } else {
      FlagField.setFlagOff(field, FlagField.Flags.System);
    }

    if (this.formGroup.controls['isVirtual'].value) {
      FlagField.setFlagOn(field, FlagField.Flags.Virtual);
    } else {
      FlagField.setFlagOff(field, FlagField.Flags.Virtual);
    }

    return field;
  }

  setAccessesToForm(accesses: AccessChip[]) {
    if (!this.formGroup || !this.formGroup.controls['accesses']) {
      return;
    }

    this.formGroup.controls['accesses'].setValue(accesses);
  }

  openEditAccesses() {
    const ref = this.dialogService
      .open(SelectAccessComponent, {
        data: {
          roles: this.roles,
          accesses: this.formGroup.controls['accesses'].value,
        },
        header: 'Выбор доступов',
        width: '70%',
      })
      .onClose.subscribe((res: AccessChip[]) => {
        if (res) {
          const deleteAccesses = this.originalAccesses.filter(
            (oa) => !res.find((r) => r.sourceId === oa.sourceId),
          );

          const accesses = [
            ...res,
            ...deleteAccesses.map((da) => {
              return {
                ...da,
                accessName: getAccessName(0),
                access: 0,
              };
            }),
          ];

          this.setAccessesToForm(accesses);
          // this.loading = true;
          // this.getFields().subscribe(() => {
          //   this.loading = false;
          // });
        }
      });
  }
}
