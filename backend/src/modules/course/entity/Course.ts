export interface CourseProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  price: number;
  discountPrice?: number;
  duration: number;
  status: "draft" | "published" | "archived";
  createdBy: string;
  requirements: string[];
  learningOutcomes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Course {
  private constructor(private readonly props: CourseProps) {}

  public static create(props: CourseProps): Course {
    return new Course(props);
  }

  public static reconstruct(props: CourseProps): Course {
    return new Course(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get title(): string {
    return this.props.title;
  }

  public get slug(): string {
    return this.props.slug;
  }

  public get description(): string {
    return this.props.description;
  }

  public get thumbnail(): string {
    return this.props.thumbnail;
  }

  public get category(): string {
    return this.props.category;
  }

  public get level(): CourseProps["level"] {
    return this.props.level;
  }

  public get language(): string {
    return this.props.language;
  }

  public get price(): number {
    return this.props.price;
  }

  public get discountPrice(): number | undefined {
    return this.props.discountPrice;
  }

  public get duration(): number {
    return this.props.duration;
  }

  public get status(): CourseProps["status"] {
    return this.props.status;
  }

  public get createdBy(): string {
    return this.props.createdBy;
  }

  public get requirements(): string[] {
    return this.props.requirements;
  }

  public get learningOutcomes(): string[] {
    return this.props.learningOutcomes;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
