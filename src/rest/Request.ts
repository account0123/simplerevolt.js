import { API } from "revolt-api";
import { APIRoutes } from "revolt-api/dist/routes";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { isAxiosError, RequestOptions } from "./index.js";
import { RevoltAPIError } from "../errors/RevoltAPIError.js";

type Methods = APIRoutes["method"];
type PickRoutes<Method extends Methods> = APIRoutes & {
  method: Method;
};
type Count<
  Str extends string,
  SubStr extends string,
  Matches extends null[] = [],
> = Str extends `${infer _}${SubStr}${infer After}` ? Count<After, SubStr, [...Matches, null]> : Matches["length"];

export class SimpleRequest {
  options: RequestOptions;
  constructor(
    private readonly api: API,
    options?: RequestOptions,
  ) {
    this.options = {
      timeout: options?.timeout || 3_000,
      retries: options?.retries || 3,
    };
  }

  delete<
    Path extends PickRoutes<"delete">["path"],
    Route extends PickRoutes<"delete"> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(path: Path, params?: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"]> {
    return this.runRequest("delete", path, params, config);
  }

  get<
    Path extends PickRoutes<"get">["path"],
    Route extends PickRoutes<"get"> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(path: Path, params?: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"]> {
    return this.runRequest("get", path, params, config);
  }

  patch<
    Path extends PickRoutes<"patch">["path"],
    Route extends PickRoutes<"patch"> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(path: Path, params: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"]> {
    return this.runRequest("patch", path, params, config);
  }

  post<
    Path extends PickRoutes<"post">["path"],
    Route extends PickRoutes<"post"> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(path: Path, params?: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"]> {
    return this.runRequest("post", path, params, config);
  }

  put<
    Path extends PickRoutes<"put">["path"],
    Route extends PickRoutes<"put"> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(path: Path, params?: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"] | undefined> {
    return this.runRequest("put", path, params, config);
  }

  /**
   * Makes a request through revolt-api, using timeout and error handling
   */
  private async makeRequest<
    Path extends PickRoutes<Methods>["path"],
    Route extends PickRoutes<Methods> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(
    method: Methods,
    path: Path,
    params: Route["params"],
    axiosConfig?: AxiosRequestConfig,
  ): Promise<Route["response"]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout);
    if (axiosConfig?.signal) {
      if (axiosConfig.signal.aborted) {
        controller.abort();
      }
    }

    let response;
    try {
      response = await this.api.req(method, path, params, axiosConfig);
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    return response;
  }

  /**
   * Same as makeRequest, but filters out params
   */
  private async makeRequestWithoutParams<
    Path extends PickRoutes<Methods>["path"],
    Route extends PickRoutes<Methods> & {
      params: undefined;
      path: Path;
      parts: Count<Path, "/">;
    },
  >(method: Methods, path: Path, axiosConfig?: AxiosRequestConfig): Promise<Route["response"]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout);
    if (axiosConfig?.signal) {
      if (axiosConfig.signal.aborted) {
        controller.abort();
      }
    }

    let response;
    try {
      response = await this.api.req<Methods, PickRoutes<Methods>, Path, Route>(method, path, undefined, {
        signal: controller.signal,
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    return response;
  }

  private async runRequest<
    Path extends PickRoutes<Methods>["path"],
    Route extends PickRoutes<Methods> & {
      path: Path;
      parts: Count<Path, "/">;
    },
  >(method: Methods, path: Path, params?: Route["params"], config?: AxiosRequestConfig): Promise<Route["response"]> {
    let response;
    try {
      if (params) {
        response = (await this.makeRequest<Path, Route>(method, path, params, config)) as Route["response"];
      } else {
        response = (await this.makeRequestWithoutParams(method, path, config)) as Route["response"];
      }
    } catch (error: unknown | AxiosError) {
      if (error && typeof error == "object") {
        if (isAxiosError(error)) {
          const response = error.response;
          if (response) {
            throw new RevoltAPIError(response.data, response.status, method, response.config.url || "/");
          }
        }
      }

      throw error;
    }
    return response;
  }
}
