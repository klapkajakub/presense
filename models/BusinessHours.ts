import mongoose, { Document } from 'mongoose';

interface ITimeRange {
  open: string;  // 24-hour format "HH:MM"
  close: string; // 24-hour format "HH:MM"
}

interface IDaySchedule {
  isOpen: boolean;
  ranges: ITimeRange[];
}

export interface IBusinessHours extends Document {
  regularHours: {
    monday: IDaySchedule;
    tuesday: IDaySchedule;
    wednesday: IDaySchedule;
    thursday: IDaySchedule;
    friday: IDaySchedule;
    saturday: IDaySchedule;
    sunday: IDaySchedule;
  };
  specialDays: {
    date: Date;
    isOpen: boolean;
    ranges?: ITimeRange[];
    note?: string;
  }[];
}

const TimeRangeSchema = new mongoose.Schema({
  open: { type: String, required: true },
  close: { type: String, required: true }
});

const DayScheduleSchema = new mongoose.Schema({
  isOpen: { type: Boolean, default: true },
  ranges: [TimeRangeSchema]
});

const BusinessHoursSchema = new mongoose.Schema<IBusinessHours>({
  regularHours: {
    monday: { type: DayScheduleSchema, required: true },
    tuesday: { type: DayScheduleSchema, required: true },
    wednesday: { type: DayScheduleSchema, required: true },
    thursday: { type: DayScheduleSchema, required: true },
    friday: { type: DayScheduleSchema, required: true },
    saturday: { type: DayScheduleSchema, required: true },
    sunday: { type: DayScheduleSchema, required: true }
  },
  specialDays: [{
    date: { type: Date, required: true },
    isOpen: { type: Boolean, required: true },
    ranges: [TimeRangeSchema],
    note: String
  }]
}, {
  timestamps: true
});

const BusinessHours = (mongoose.models.BusinessHours as mongoose.Model<IBusinessHours>) ||
  mongoose.model<IBusinessHours>('BusinessHours', BusinessHoursSchema);

export { BusinessHours }; 