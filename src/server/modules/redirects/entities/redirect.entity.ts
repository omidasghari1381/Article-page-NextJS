import { Entity, Column, Unique } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import type { RedirectStatus } from "../enums/RedirectStatus.enum";

@Entity("redirects")
@Unique("UQ_redirect_fromPath", ["fromPath"])
export class Redirect extends AbstractEntity {
  @Column({ type: "varchar", length: 512 })
  fromPath!: string;

  @Column({ type: "varchar", length: 512 })
  toPath!: string;

  @Column({ type: "int", default: 301 })
  statusCode!: RedirectStatus;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;
}
