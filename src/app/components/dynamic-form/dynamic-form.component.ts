import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

import {FieldConfig, Validator} from '../../field.interface';

@Component({
    selector: 'dynamic-form',
    template: `
        <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">
            <ng-container *ngFor="let field of fields;" dynamicField [field]="field" [group]="form">
            </ng-container>
        </form>
    `,
    styles: []
})
export class DynamicFormComponent implements OnInit {

    @Input() fields: FieldConfig[] = [];
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();

    public form: FormGroup;

    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.createControl();
    }

    public get value() {
        return this.form.value;
    }

    public createControl() {
        const group = this.fb.group({});
        this.fields.forEach(field => {
            if (field.type === 'button') {
                return;
            }
            const control = this.fb.control(
                field.value,
                this.bindValidations(field.validations || [])
            );
            group.addControl(field.name, control);
        });
        return group;
    }

    public bindValidations(validations: any) {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach(valid => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }

    public onSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.form.valid) {
            this.submit.emit(this.form.value);
        } else {
            this.validateAllFormFields(this.form);
        }
    }

    public validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            control.markAsTouched({onlySelf: true});
        });
    }

}
