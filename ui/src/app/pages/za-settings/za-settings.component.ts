import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ServerAuth, ServerUser } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';

@Component({
  selector: 'za-za-settings',
  templateUrl: './za-settings.component.html',
  styleUrls: ['./za-settings.component.scss']
})
export class ZASettingsComponent implements OnInit {

  @Input() user!: ServerAuth.IPayload | null;

  userSubj = new Subject<ServerAuth.IPayload | null>();

  constructor(private sessionService: SessionService) {
    this.userSubj.next(this.user);

  }

  ngOnInit(): void {}

}
