import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventsService {
    private themeSubject = new Subject<any>();

    publishToggle(data: any) {
        this.themeSubject.next();
    }

    getObservable(): Subject<any> {
        return this.themeSubject;
    }
}